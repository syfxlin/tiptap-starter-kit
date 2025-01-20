import { Editor, Extension, isActive, isNodeSelection, isTextSelection, Range } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { FloatMenuView } from "./view";

export interface FloatMenuButtonItem {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  active: (editor: Editor, range: Range) => boolean;
  action: (editor: Editor, range: Range) => void;
}

export interface FloatMenuRenderItem {
  id: string;
  render: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  update?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
  destroy?: (props: { editor: Editor; view: FloatMenuView; range: Range; root: HTMLElement }) => void;
}

export interface FloatMenuItemStorage {
  floatMenu?: {
    hide?: boolean;
    items?: FloatMenuButtonItem | FloatMenuRenderItem | Array<FloatMenuButtonItem | FloatMenuRenderItem>;
  };
}

export interface FloatMenuOptions {
  items: Array<string>;
}

export const FloatMenu = Extension.create<FloatMenuOptions>({
  name: "floatMenu",
  addOptions() {
    return {
      items: [
        "bold",
        "italic",
        "strike",
        "underline",
        "|",
        "code",
        "highlight",
        "link",
        "|",
        "superscript",
        "subscript",
      ],
    };
  },
  addProseMirrorPlugins() {
    const hiddens = new Set<string>();
    const mappings = new Map<string, FloatMenuButtonItem | FloatMenuRenderItem>();
    for (const [name, storage] of Object.entries(this.editor.storage as Record<string, FloatMenuItemStorage>)) {
      if (storage?.floatMenu) {
        if (storage.floatMenu.hide) {
          hiddens.add(name);
        }
        if (storage.floatMenu.items) {
          const menus = Array.isArray(storage.floatMenu.items) ? storage.floatMenu.items : [storage.floatMenu.items];
          for (const menu of menus) {
            mappings.set(menu.id, menu);
          }
        }
      }
    }
    if (!mappings.size || !this.options.items.length) {
      return [];
    }
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: FloatMenuView.create({
          editor: this.editor,
          tippy: {
            animation: "fade",
          },
          show: ({ editor }) => {
            const { state, isEditable } = editor;
            if (!isEditable) {
              return false;
            }
            const { selection, doc } = state;
            if (selection.empty) {
              return false;
            }
            const isEmptyTextBlock = !doc.textBetween(selection.from, selection.to).length && isTextSelection(selection);
            if (isEmptyTextBlock) {
              return false;
            }
            for (const hidden of hiddens) {
              if (isActive(state, hidden)) {
                return false;
              }
            }
            return !isNodeSelection(selection);
          },
          onInit: ({ view, range, editor, root }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const item = mappings.get(name);
                if (item) {
                  if ("render" in item) {
                    const node = document.createElement("div");
                    item.render({ view, editor, range, root: node });
                    node.setAttribute("data-fm-id", name);
                    root.append(node);
                  } else {
                    const node = view.createButton({
                      id: item.id,
                      name: item.name,
                      icon: item.icon,
                      shortcut: item.shortcut,
                      onClick: () => item.action(editor, range),
                    });
                    if (item.active && item.active(editor, range)) {
                      node.setAttribute("data-active", "true");
                    }
                    node.setAttribute("data-fm-id", name);
                    root.append(node);
                  }
                }
              } else {
                const divider = view.createDivider();
                root.append(divider);
              }
            }
          },
          onUpdate: ({ view, range, editor, root }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const node = root.querySelector(`[data-fm-id="${name}"]`) as HTMLElement | undefined;
                const item = mappings.get(name);
                if (node && item) {
                  if ("render" in item) {
                    if (item.update) {
                      item.update({ view, editor, range, root: node });
                    }
                  } else {
                    if (item.active && item.active(editor, range)) {
                      node.setAttribute("data-active", "true");
                    } else {
                      node.removeAttribute("data-active");
                    }
                  }
                }
              }
            }
          },
          onDestroy: ({ view, range, editor, root }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const node = root.querySelector(`[data-fm-id="${name}"]`) as HTMLElement | undefined;
                const item = mappings.get(name);
                if (node && item) {
                  if ("render" in item) {
                    if (item.destroy) {
                      item.destroy({ view, editor, range, root: node });
                    }
                  }
                }
              }
            }
          },
        }),
      }),
    ];
  },
});
