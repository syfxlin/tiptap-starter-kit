import { Strike as TStrike } from "@tiptap/extension-strike";
import { MarkMarkdownStorage } from "../extensions/markdown/Markdown";

export const Strike = TStrike.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "delete",
        runner: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: (mark) => mark.type.name === this.name,
        runner: (state, mark) => {
          state.withMark(mark, {
            type: "delete",
          });
        },
      },
    } as MarkMarkdownStorage;
  },
});
