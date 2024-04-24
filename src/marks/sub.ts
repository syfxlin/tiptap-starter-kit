import { SubscriptExtensionOptions, Subscript as TSubscript } from "@tiptap/extension-subscript";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

export interface SubscriptOptions extends SubscriptExtensionOptions {
  dictionary: {
    name: string;
  };
}

export const Subscript = TSubscript.extend<SubscriptOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Subscript",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "textDirective" && node.name === "sub",
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
              type: "textDirective",
              name: "sub",
            });
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("sub"),
            shortcut: "Mod-,",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleSubscript().focus().run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
