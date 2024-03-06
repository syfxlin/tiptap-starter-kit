import { Bold as TBold } from "@tiptap/extension-bold";
import { MarkMarkdownStorage } from "../markdown/types";

export const Bold = TBold.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "strong",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "strong",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
