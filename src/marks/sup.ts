import { SuperscriptExtensionOptions, Superscript as TSuperscript } from "@tiptap/extension-superscript";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

export interface SuperscriptOptions extends SuperscriptExtensionOptions {
  dictionary: {
    name: string;
  };
}

export const Superscript = TSuperscript.extend<SuperscriptOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Superscript",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "textDirective" && node.name === "sup",
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
              name: "sup",
            });
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("sup"),
            shortcut: "Mod-.",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleSuperscript().focus().run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
