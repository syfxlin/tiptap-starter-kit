import { Editor, Extension, isMarkActive, isNodeSelection, isTextSelection } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Bold } from "../../marks/bold";
import { Italic } from "../../marks/italic";
import { Code } from "../../marks/code";
import { Strike } from "../../marks/strike";
import { Highlight } from "../../marks/highlight";
import { Link } from "../../marks/link";
import { FloatMenuView } from "./view";

export interface FloatMenuItem {
  name: string;
  icon: string;
  shortcut?: string;
  active?: (editor: Editor) => boolean;
  disable?: (editor: Editor) => boolean;
  onClick: (editor: Editor, event: MouseEvent) => void;
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
        Bold.name,
        Italic.name,
        Strike.name,
        Code.name,
        Highlight.name,
        Link.name,
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
              const item = this.editor.storage[name]?.floatMenu as FloatMenuItem | undefined;
              if (item) {
                const button = view.createButton({
                  id: name,
                  name: item.name,
                  icon: item.icon,
                  shortcut: item.shortcut,
                  onClick: event => item?.onClick(this.editor, event),
                });
                element.append(button.button);
              }
            }
          },
          onUpdate: ({ element }) => {
            for (const name of this.options.items) {
              const dom = element.querySelector(`[name="${name}"]`);
              const item = this.editor.storage[name]?.floatMenu as FloatMenuItem | undefined;
              if (dom && item) {
                if (item.disable?.(this.editor)) {
                  dom.classList.add("disable");
                  return;
                }
                dom.classList.remove("disable");
                if (item.active?.(this.editor)) {
                  dom.classList.add("active");
                }
                dom.classList.remove("active");
              }
            }
          },
        }),
      }),
    ];
  },
});
