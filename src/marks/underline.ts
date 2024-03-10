import { Underline as TUnderline } from "@tiptap/extension-underline";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { remarkDecoration } from "../extensions/markdown/plugins/decoration";

export const Underline = TUnderline.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      processor: processor => processor.use(remarkDecoration("underline", "++")),
      parser: {
        match: node => node.type === "underline",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "underline",
          });
        },
      },
    } satisfies MarkMarkdownStorage;
  },
});
