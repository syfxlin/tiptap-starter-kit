import { SuperscriptExtensionOptions, Superscript as TSuperscript } from "@tiptap/extension-superscript";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { superscript } from "../icons";

export interface SuperscriptOptions extends SuperscriptExtensionOptions {
  dictionary: {
    name: string;
  };
}

export const Superscript = TSuperscript.extend<SuperscriptOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Superscript",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "textDirective" && node.name === "sup",
        apply: (state, node, type) => {
          state.openMark(type).next(node.children).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "textDirective",
            name: "sup",
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        icon: superscript,
        shortcut: "Mod-.",
        active: editor => editor.isActive(this.name),
        disable: editor => !editor.schema.marks[this.name],
        onClick: editor => editor.chain().toggleSuperscript().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
