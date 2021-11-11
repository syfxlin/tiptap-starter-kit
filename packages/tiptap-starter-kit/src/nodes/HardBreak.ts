import { HardBreak as THardBreak } from "@tiptap/extension-hard-break";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const HardBreak = THardBreak.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "break",
        runner: (state, node, type) => {
          state.addNode(type);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "break",
          });
        },
      },
    } as NodeMarkdownStorage;
  },
});
