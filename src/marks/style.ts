import { TextStyle as TTextStyle } from "@tiptap/extension-text-style";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Style = TTextStyle.extend({
  addAttributes() {
    return {
      style: {
        default: "",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "textDirective" && node.name === "style",
        apply: (state, node, type) => {
          state.openMark(type, node.attributes).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "textDirective",
            name: "style",
            attributes: mark.attrs,
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
