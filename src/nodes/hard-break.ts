import { HardBreak as THardBreak, HardBreakOptions as THardBreakOptions } from "@tiptap/extension-hard-break";
import { NodeMarkdownStorage } from "../extensions/markdown";

export interface HardBreakOptions extends THardBreakOptions {}

export const HardBreak = THardBreak.extend<HardBreakOptions>({
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
