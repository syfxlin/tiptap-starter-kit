import { Code as TCode, CodeOptions as TCodeOptions } from "@tiptap/extension-code";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { code } from "../utils/icons";

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
        view: code,
        shortcut: "Mod-E",
        active: editor => editor.isActive(this.name),
        action: editor => editor.chain().toggleCode().focus().run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
