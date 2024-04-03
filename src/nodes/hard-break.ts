import { HardBreak as THardBreak } from "@tiptap/extension-hard-break";
import { NodeMarkdownStorage } from "../extensions/markdown";

export const HardBreak = THardBreak.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "break",
          apply: (state, _node, type) => {
            state.addNode(type);
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state) => {
            state.addNode({
              type: "break",
            });
          },
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
