import { Highlight as THighlight, HighlightOptions as THighlightOptions } from "@tiptap/extension-highlight";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { highlight } from "../icons";

export interface HighlightOptions extends THighlightOptions {
  dictionary: {
    name: string;
  };
}

export const Highlight = THighlight.extend<HighlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Highlight",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      processor: processor => processor.use(remarkDecoration("highlight", "==")),
      parser: {
        match: node => node.type === "highlight",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "highlight",
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        icon: highlight,
        shortcut: "Mod-Shift-H",
        active: editor => editor.isActive(this.name),
        disable: editor => !editor.schema.marks[this.name],
        onClick: editor => editor.chain().toggleHighlight().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
