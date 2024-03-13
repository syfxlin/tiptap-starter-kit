import { Underline as TUnderline, UnderlineOptions as TUnderlineOptions } from "@tiptap/extension-underline";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { underline } from "../utils/icons";

export interface UnderlineOptions extends TUnderlineOptions {
  dictionary: {
    name: string;
  };
}

export const Underline = TUnderline.extend<UnderlineOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Underline",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      processor: processor => processor.use(remarkDecoration("underline", "+")),
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
      floatMenu: {
        name: this.options.dictionary.name,
        view: underline,
        shortcut: "Mod-U",
        active: editor => editor.isActive(this.name),
        onClick: editor => editor.chain().toggleUnderline().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});