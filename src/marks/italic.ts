import { Italic as TItalic, ItalicOptions as TItalicOptions } from "@tiptap/extension-italic";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

export interface ItalicOptions extends TItalicOptions {
  dictionary: {
    name: string;
  };
}

export const Italic = TItalic.extend<ItalicOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Italic",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "emphasis",
          apply: (state, node, type) => {
            state.openMark(type);
            state.next(node.children);
            state.closeMark(type);
          },
        },
        serializer: {
          match: mark => mark.type.name === this.name,
          apply: (state, mark) => {
            state.withMark(mark, {
              type: "emphasis",
            });
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("italic"),
            shortcut: "Mod-I",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleItalic().focus().run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
