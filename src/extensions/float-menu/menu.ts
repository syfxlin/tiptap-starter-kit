import { Editor, Extension, isMarkActive, isNodeSelection, isTextSelection } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { FloatMenuView } from "./view";

export interface FloatMenuItem {
  name: string;
  view: string;
  shortcut?: string;
  active?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => boolean;
  onClick: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
  onInit?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
  onUpdate?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
  onDestroy?: (editor: Editor, view: FloatMenuView, element: HTMLElement) => void;
}

export interface FloatMenuItemStorage {
  floatMenu: FloatMenuItem;
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
    if (!this.options.items.length) {
      return [];
    }
    return [
      new Plugin({
        key: new PluginKey("float-menu"),
        view: () => new FloatMenuView({
          editor: this.editor,
          show: ({ editor, range }) => {
            if (!editor.isEditable) {
              return false;
            }
            const state = editor.state;
            if (state.selection.empty) {
              return false;
            }
            const isEmptyTextBlock = !state.doc.textBetween(range.from, range.to).length && isTextSelection(state.selection);
            if (isEmptyTextBlock) {
              return false;
            }
            return (
              !isMarkActive(state, "link") &&
              // TODO: remove comments
              // !isNodeActive(state, "image") &&
              // !isNodeActive(state, "table") &&
              // !isNodeActive(state, "codeBlock") &&
              !isNodeSelection(state.selection)
            );
          },
          onInit: ({ view, element }) => {
            for (const name of this.options.items) {
              if (name !== "|") {
                const item = this.editor.storage[name]?.floatMenu as FloatMenuItem | undefined;
                if (item) {
                  const button = view.createButton({
                    id: name,
                    name: item.name,
                    view: item.view,
                    shortcut: item.shortcut,
                    onClick: () => item?.onClick(this.editor, view, button.button),
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
                const item = this.editor.storage[name]?.floatMenu as FloatMenuItem | undefined;
                if (dom && item) {
                  item.onUpdate?.(this.editor, view, element);
                  if (item.active?.(this.editor, view, dom)) {
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
                const item = this.editor.storage[name]?.floatMenu as FloatMenuItem | undefined;
                if (dom && item) {
                  item.onDestroy?.(this.editor, view, element);
                }
              }
            }
          },
        }),
      }),
    ];
  },
});
