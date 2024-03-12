import { Highlight as THighlight, HighlightOptions as THighlightOptions } from "@tiptap/extension-highlight";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { DecorationData, remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { highlight } from "../icons";

export interface HighlightOptions extends Omit<THighlightOptions, "multicolor"> {
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
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (e) => {
          const value = e.getAttribute("data-color");
          return value?.length === 1 ? value : null;
        },
        renderHTML: (a) => {
          if (!a.color) {
            return {};
          }
          return { "data-color": a.color };
        },
      },
      background: {
        default: null,
        parseHTML: (e) => {
          const value = e.getAttribute("data-background");
          return value?.length === 1 ? value : null;
        },
        renderHTML: (a) => {
          if (!a.background) {
            return {};
          }
          return { "data-background": a.background };
        },
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      processor: processor => processor.use(remarkDecoration("highlight", "=", true)),
      parser: {
        match: node => node.type === "highlight",
        apply: (state, node, type) => {
          const data = node.data as DecorationData;
          const split = data?.flags?.split("") ?? [];
          state.openMark(type, {
            color: split[0] && split[0] !== "_" ? split[0] : undefined,
            background: split[1] && split[1] !== "_" ? split[1] : undefined,
          });
          state.next(node.children);
          state.closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          if (mark.attrs.color || mark.attrs.background) {
            const flags = (mark.attrs.color ?? "_") + (mark.attrs.background ?? "_");
            state.withMark(mark, {
              type: "highlight",
              data: { flags },
            });
          } else {
            state.withMark(mark, {
              type: "highlight",
            });
          }
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
