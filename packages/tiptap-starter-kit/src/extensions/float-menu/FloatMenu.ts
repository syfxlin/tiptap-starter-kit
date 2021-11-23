import {
  Editor,
  Extension,
  isMarkActive,
  isNodeActive,
  isNodeSelection,
  isTextSelection,
} from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import FloatMenuView from "./FloatMenuView";
import { buttonView } from "./utils";
import { defaultFloatMenuItems } from "./default-items";

export type FloatMenuItem = {
  name: string;
  icon: (() => HTMLElement) | HTMLElement | string;
  shortcut?: string;
  disable?: (editor: Editor) => boolean;
  active: (editor: Editor) => boolean;
  command: (editor: Editor) => void;
};

export type FloatMenuOptions = {
  pluginKey: string;
  items: FloatMenuItem[];
};

export const FloatMenu = Extension.create<FloatMenuOptions>({
  name: "floatMenu",
  addOptions() {
    return {
      pluginKey: "floatMenu",
      items: defaultFloatMenuItems,
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(this.options.pluginKey),
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            shouldShow: ({ editor, range }) => {
              if (!editor.isEditable) {
                return false;
              }
              const state = editor.state;
              const { doc, selection } = state;
              const { empty } = selection;
              if (empty) {
                return false;
              }
              const isEmptyTextBlock =
                !doc.textBetween(range.from, range.to).length &&
                isTextSelection(state.selection);
              if (isEmptyTextBlock) {
                return false;
              }
              return (
                !isMarkActive(state, "link") &&
                !isNodeActive(state, "image") &&
                !isNodeActive(state, "table") &&
                !isNodeActive(state, "codeBlock") &&
                !isNodeSelection(state.selection)
              );
            },
            init: (dom) => {
              const nodes = this.options.items.map((item) => {
                const view = buttonView({
                  name: item.name,
                  icon: item.icon,
                  shortcut: item.shortcut,
                });
                view.button.addEventListener("click", () => {
                  item.command(this.editor);
                });
                return view.button;
              });
              dom.append(...nodes);
            },
            update: (dom) => {
              this.options.items.forEach((item, index) => {
                const disable = item.disable?.(this.editor);
                if (disable) {
                  dom.children[index].classList.add("disable");
                  return;
                }
                dom.children[index].classList.remove("disable");

                const active = item.active(this.editor);
                if (active) {
                  dom.children[index].classList.add("active");
                  return;
                }
                dom.children[index].classList.remove("active");
              });
            },
          }),
      }),
    ];
  },
});
