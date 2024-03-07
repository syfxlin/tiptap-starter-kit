import { Highlight as THighlight } from "@tiptap/extension-highlight";
import { MarkMarkdownStorage } from "../extensions/markdown";

export const Highlight = THighlight.extend({
  addStorage() {
    return {
      ...this.parent?.(),
    } satisfies MarkMarkdownStorage;
  },
});
