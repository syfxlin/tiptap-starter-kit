import { Italic as TItalic } from "@tiptap/extension-italic";
import { MarkMarkdownStorage } from "../extensions/markdown/Markdown";

export const Italic = TItalic.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "emphasis",
        runner: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: (mark) => mark.type.name === this.name,
        runner: (state, mark) => {
          state.withMark(mark, {
            type: "emphasis",
          });
        },
      },
    } as MarkMarkdownStorage;
  },
});
