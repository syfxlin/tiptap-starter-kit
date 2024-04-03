import { Blockquote as IBlockquote, BlockquoteOptions as TBlockquoteOptions } from "@tiptap/extension-blockquote";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface BlockquoteOptions extends TBlockquoteOptions {
  dictionary: {
    name: string;
  };
}

export const Blockquote = IBlockquote.extend<BlockquoteOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Blockquote",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "blockquote",
          apply: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({ type: "blockquote" });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("blockquote"),
            shortcut: "Mod-Shift-B",
            keywords: "blockquote,bq,yyk",
            action: editor => editor.chain().toggleBlockquote().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
