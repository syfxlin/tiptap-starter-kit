import { Heading as THeading } from "@tiptap/extension-heading";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const Heading = THeading.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "heading",
        runner: (state, node, type) => {
          const depth = node.depth as number;
          state
            .openNode(type, { level: depth })
            .next(node.children)
            .closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "heading",
              depth: node.attrs.level,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
