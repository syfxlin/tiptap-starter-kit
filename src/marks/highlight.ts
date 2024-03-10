import { Highlight as THighlight } from "@tiptap/extension-highlight";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Highlight = THighlight.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "highlight",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "highlight",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
