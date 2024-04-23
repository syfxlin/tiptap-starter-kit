import { Paragraph as TParagraph, ParagraphOptions as TParagraphOptions } from "@tiptap/extension-paragraph";
import { NodeMarkdownStorage } from "../extensions/markdown";

export interface ParagraphOptions extends TParagraphOptions {}

export const Paragraph = TParagraph.extend<ParagraphOptions>({
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "paragraph",
          apply: (state, node, type) => {
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
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({ type: "paragraph" });
            if (node.type.name === "text") {
              state.addNode({
                type: "text",
                value: node.text,
              });
            } else {
              state.next(node.content);
            }
            state.closeNode();
          },
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
