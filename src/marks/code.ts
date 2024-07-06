import { Code as TCode, CodeOptions as TCodeOptions } from "@tiptap/extension-code";
import { markInputRule, markPasteRule } from "@tiptap/core";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

const INPUT_REGEX = /(?:^|[^`])(`(?!\s+`)([^`]+)`)$/;
const PASTE_REGEX = /(?:^|[^`])(`(?!\s+`)([^`]+)`(?!\s+`))/g;

export interface CodeOptions extends TCodeOptions {
  dictionary: {
    name: string;
  };
}

export const Code = TCode.extend<CodeOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Code",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "inlineCode",
          apply: (state, node, type) => {
            state.openMark(type);
            state.addText(node.value);
            state.closeMark(type);
          },
        },
        serializer: {
          match: mark => mark.type.name === this.name,
          apply: (state, _mark, node) => {
            state.addNode({
              type: "inlineCode",
              value: node.text ?? "",
            });
            return true;
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("code"),
            shortcut: "Mod-E",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleCode().focus().run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
  addInputRules() {
    return [
      markInputRule({
        find: INPUT_REGEX,
        type: this.type,
      }),
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: PASTE_REGEX,
        type: this.type,
      }),
    ];
  },
});
