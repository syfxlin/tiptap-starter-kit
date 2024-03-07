import { Document as TDocument } from "@tiptap/extension-document";
import { NodeMarkdownStorage } from "../extensions/markdown";

export const Document = TDocument.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "root",
        apply: (state, node, type) => {
          state.openNode(type).next(node.children);
        },
      },
      serializer: {
        match: node => node.type.name === this.name,
        apply: (state, node) => {
          state.openNode({ type: "root" }).next(node.content);
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
