import { Strike as TStrike, StrikeOptions as TStrikeOptions } from "@tiptap/extension-strike";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { strike } from "../utils/icons";

export interface StrikeOptions extends TStrikeOptions {
  dictionary: {
    name: string;
  };
}

export const Strike = TStrike.extend<StrikeOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Strike",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "delete",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "delete",
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        view: strike,
        shortcut: "Mod-Shift-I",
        active: editor => editor.isActive(this.name),
        onClick: editor => editor.chain().toggleStrike().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
