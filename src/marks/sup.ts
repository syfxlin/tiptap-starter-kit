import { Superscript as TSuperscript } from "@tiptap/extension-superscript";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Superscript = TSuperscript.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "textDirective" && node.name === "sup",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "textDirective",
            name: "sup",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
