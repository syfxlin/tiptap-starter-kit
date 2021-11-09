import { Text as TText } from "@tiptap/extension-text";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const Text = TText.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: ({ type }) => type === "text",
        runner: (state, node) => {
          state.addText(node.value);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "text",
            value: node.text,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
});
