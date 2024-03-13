import { Bold as TBold, BoldOptions as TBoldOptions } from "@tiptap/extension-bold";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { bold } from "../utils/icons";

export interface BoldOptions extends TBoldOptions {
  dictionary: {
    name: string;
  };
}

export const Bold = TBold.extend<BoldOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Bold",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "strong",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "strong",
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        view: bold,
        shortcut: "Mod-B",
        active: editor => editor.isActive(this.name),
        onClick: editor => editor.chain().toggleBold().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
