import { SubscriptExtensionOptions, Subscript as TSubscript } from "@tiptap/extension-subscript";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { subscript } from "../utils/icons";

export interface SubscriptOptions extends SubscriptExtensionOptions {
  dictionary: {
    name: string;
  };
}

export const Subscript = TSubscript.extend<SubscriptOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Subscript",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "textDirective" && node.name === "sub",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "textDirective",
            name: "sub",
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        view: subscript,
        shortcut: "Mod-,",
        active: editor => editor.isActive(this.name),
        onClick: editor => editor.chain().toggleSubscript().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
