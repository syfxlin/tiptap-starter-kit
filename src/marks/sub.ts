import { Subscript as TSubscript } from "@tiptap/extension-subscript";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Subscript = TSubscript.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "textDirective" && node.name === "sub",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "textDirective",
            name: "sub",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
