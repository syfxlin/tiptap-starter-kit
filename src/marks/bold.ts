import { Bold as TBold, BoldOptions as TBoldOptions } from "@tiptap/extension-bold";
import { markInputRule, markPasteRule } from "@tiptap/core";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { icon } from "../utils/icons";

const STAR_INPUT_REGEX = /(?:^|[^*])(\*\*(?!\s+\*\*)([^*]+)\*\*)$/;
const STAR_PASTE_REGEX = /(?:^|[^*])(\*\*(?!\s+\*\*)([^*]+)\*\*(?!\s+\*\*))/g;
const UNDERSCORE_INPUT_REGEX = /(?:^|[^_])(__(?!\s+__)([^_]+)__)$/;
const UNDERSCORE_PASTE_REGEX = /(?:^|[^_])(__(?!\s+__)([^_]+)__(?!\s+__))/g;

export interface BoldOptions extends TBoldOptions {
  dictionary: {
    name: string;
  };
}

export const Bold = TBold.extend<BoldOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Bold",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "strong",
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
              type: "strong",
            });
          },
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("bold"),
            shortcut: "Mod-B",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleBold().focus().run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
  addInputRules() {
    return [
      markInputRule({
        find: STAR_INPUT_REGEX,
        type: this.type,
      }),
      markInputRule({
        find: UNDERSCORE_INPUT_REGEX,
        type: this.type,
      }),
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: STAR_PASTE_REGEX,
        type: this.type,
      }),
      markPasteRule({
        find: UNDERSCORE_PASTE_REGEX,
        type: this.type,
      }),
    ];
  },
});
