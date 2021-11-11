import { HorizontalRule as THorizontalRule } from "@tiptap/extension-horizontal-rule";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const HorizontalRule = THorizontalRule.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "thematicBreak",
        runner: (state, node, type) => {
          state.addNode(type);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "thematicBreak",
          });
        },
      },
    } as NodeMarkdownStorage;
  },
});
