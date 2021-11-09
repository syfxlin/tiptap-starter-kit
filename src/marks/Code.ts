import { Code as TCode } from "@tiptap/extension-code";
import { MarkMarkdownStorage } from "../extensions/markdown/Markdown";

export const Code = TCode.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "inlineCode",
        runner: (state, node, type) => {
          state.openMark(type).addText(node.value).closeMark(type);
        },
      },
      serializer: {
        match: (mark) => mark.type.name === this.name,
        runner: (state, mark, node) => {
          state.addNode({
            type: "inlineCode",
            value: node.text || "",
          });
          return true;
        },
      },
    } as MarkMarkdownStorage;
  },
});
