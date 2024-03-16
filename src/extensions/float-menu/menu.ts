import { Editor, Extension, isActive, isNodeSelection, isTextSelection } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { FloatMenuView } from "./view";

export interface FloatMenuItem {
  id: string;
  name: string;
  view: string;
  shortcut?: string;
  active: (editor: Editor, view: FloatMenuView) => boolean;
  action: (editor: Editor, view: FloatMenuView) => void;
  onInit?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
  onUpdate?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
  onDestroy?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
}

export interface FloatMenuItemStorage {
  floatMenu: FloatMenuItem | Array<FloatMenuItem>;
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
    const mappings = new Map<string, FloatMenuItem>();
    for (const storage of Object.values(this.editor.storage)) {
      if (storage?.floatMenu) {
        const menus = Array.isArray(storage.floatMenu) ? storage.floatMenu : [storage.floatMenu];
        for (const menu of menus) {
          mappings.set(menu.id, menu);
        }
      }
    }
    if (!mappings.size || !this.options.items.length) {
      return [];
    }
    return [
      new Plugin({
        key: new PluginKey("float-menu"),
        view: () => new FloatMenuView({
          editor: this.editor,
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
            return (
              !isActive(state, "link") &&
              !isActive(state, "image") &&
              !isActive(state, "table") &&
              !isActive(state, "codeBlock") &&
              !isNodeSelection(selection)
            );
          },
          onInit: ({ view, element }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const item = mappings.get(name);
                if (item) {
                  const button = view.createButton({
                    id: name,
                    name: item.name,
                    view: item.view,
                    shortcut: item.shortcut,
                    onClick: () => item.action(this.editor, view),
                  });
                  element.append(button.button);
                  item.onInit?.(this.editor, view, button.button);
                }
              } else {
                const divider = view.createDivider();
                element.append(divider.divider);
              }
            }
          },
          onUpdate: ({ view, element }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const dom = element.querySelector(`[name="${name}"]`) as HTMLElement | undefined;
                const item = mappings.get(name);
                if (dom && item) {
                  item.onUpdate?.(this.editor, view, dom);
                  if (item.active(this.editor, view)) {
                    dom.classList.add("active");
                    continue;
                  }
                  dom.classList.remove("active");
                }
              }
            }
          },
          onDestroy: ({ view, element }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const dom = element.querySelector(`[name="${name}"]`) as HTMLElement | undefined;
                const item = mappings.get(name);
                if (dom && item) {
                  item.onDestroy?.(this.editor, view, dom);
                }
              }
            }
          },
        }),
      }),
    ];
  },
});
