import { Strike as TStrike, StrikeOptions as TStrikeOptions } from "@tiptap/extension-strike";
import { markInputRule, markPasteRule } from "@tiptap/core";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

const INPUT_REGEX = /(?:^|[^~])(~~(?!\s+~~)([^~]+)~~)$/;
const PASTE_REGEX = /(?:^|[^~])(~~(?!\s+~~)([^~]+)~~(?!\s+~~))/g;

export interface StrikeOptions extends TStrikeOptions {
  dictionary: {
    name: string;
  };
}

export const Strike = TStrike.extend<StrikeOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Strike",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "delete",
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
              type: "delete",
            });
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("strike"),
            shortcut: "Mod-Shift-I",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleStrike().focus().run(),
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
