import { Code as TCode, CodeOptions as TCodeOptions } from "@tiptap/extension-code";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { code } from "../icons";

export interface CodeOptions extends TCodeOptions {
  dictionary: {
    name: string;
  };
}

export const Code = TCode.extend<CodeOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Code",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "inlineCode",
        apply: (state, node, type) => {
          state.openMark(type).addText(node.value).closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, _mark, node) => {
          state.addNode({
            type: "inlineCode",
            value: node.text ?? "",
          });
          return true;
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        icon: code,
        shortcut: "Mod-E",
        active: editor => editor.isActive(this.name),
        disable: editor => !editor.schema.marks[this.name],
        onClick: editor => editor.chain().toggleCode().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
