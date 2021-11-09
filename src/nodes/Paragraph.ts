import { Paragraph as TParagraph } from "@tiptap/extension-paragraph";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const Paragraph = TParagraph.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "paragraph",
        runner: (state, node, type) => {
          state.openNode(type);
          if (node.children) {
            state.next(node.children);
          } else {
            state.addText(node.value);
          }
          state.closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "paragraph",
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
