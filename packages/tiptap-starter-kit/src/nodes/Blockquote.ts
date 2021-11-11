import { Blockquote as IBlockquote } from "@tiptap/extension-blockquote";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const Blockquote = IBlockquote.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "blockquote",
        runner: (state, node, type) => {
          state.openNode(type).next(node.children).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "blockquote",
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
