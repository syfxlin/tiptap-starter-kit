import { Text as TText } from "@tiptap/extension-text";
import { NodeMarkdownStorage } from "../extensions/markdown";

export const Text = TText.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: ({ type }) => type === "text",
          apply: (state, node) => {
            state.addText(node.value);
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.addNode({
              type: "text",
              value: node.text,
            });
          },
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
