import { HardBreak as THardBreak, HardBreakOptions as THardBreakOptions } from "@tiptap/extension-hard-break";
import { NodeMarkdownStorage } from "../extensions/markdown";

// eslint-disable-next-line ts/no-empty-object-type
export interface HardBreakOptions extends THardBreakOptions {
}

export const HardBreak = THardBreak.extend<HardBreakOptions>({
  name: "hardBreak",
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
