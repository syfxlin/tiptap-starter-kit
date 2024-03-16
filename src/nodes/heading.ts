import { Heading as THeading, HeadingOptions as THeadingOptions } from "@tiptap/extension-heading";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { heading1, heading2, heading3, heading4, heading5, heading6 } from "../utils/icons";

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
      blockMenu: ([
        { id: 1, icon: heading1 },
        { id: 2, icon: heading2 },
        { id: 3, icon: heading3 },
        { id: 4, icon: heading4 },
        { id: 5, icon: heading5 },
        { id: 6, icon: heading6 },
      ] as const).map(item => ({
        id: `${this.name}${item.id}`,
        name: `${this.options.dictionary.name} ${item.id}`,
        icon: item.icon,
        shortcut: `Mod-Alt-${item.id}`,
        keywords: `heading${item.id},title${item.id},bt${item.id}`,
        action: editor => editor.chain().toggleHeading({ level: item.id }).focus().run(),
      })),
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
