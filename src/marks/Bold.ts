import { Bold as TBold } from "@tiptap/extension-bold";
import { MarkMarkdownStorage } from "../extensions/markdown/Markdown";

export const Bold = TBold.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "strong",
        runner: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: (mark) => mark.type.name === this.name,
        runner: (state, mark) => {
          state.withMark(mark, {
            type: "strong",
          });
        },
      },
    } as MarkMarkdownStorage;
  },
});
