import { Heading as THeading, HeadingOptions as THeadingOptions } from "@tiptap/extension-heading";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface HeadingOptions extends THeadingOptions {
  dictionary: {
    name: string;
  };
}

export const Heading = THeading.extend<HeadingOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Heading",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "heading",
          apply: (state, node, type) => {
            const depth = node.depth as number;
            state.openNode(type, { level: depth });
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({
              type: "heading",
              depth: node.attrs.level,
            });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
      blockMenu: {
        items: ([1, 2, 3, 4, 5, 6] as const).map(level => ({
          id: `${this.name}${level}`,
          name: `${this.options.dictionary.name} ${level}`,
          icon: icon(`h${level}`),
          shortcut: `Mod-Alt-${level}`,
          keywords: `heading${level},title${level},bt${level}`,
          action: editor => editor.chain().toggleHeading({ level }).focus().run(),
        })),
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
