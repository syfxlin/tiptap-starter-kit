import { Strike as TStrike } from "@tiptap/extension-strike";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Strike = TStrike.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "delete",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "delete",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
