import { Highlight as THighlight, HighlightOptions as THighlightOptions } from "@tiptap/extension-highlight";
import tippy from "tippy.js";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { DecorationData, remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { highlight } from "../utils/icons";

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
          state.openMark(type, { color: data?.flags || undefined });
          state.next(node.children);
          state.closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "highlight",
            data: {
              flags: mark.attrs.color,
            },
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        view: highlight,
        shortcut: "Mod-Shift-H",
        active: editor => editor.isActive(this.name),
        onClick: editor => editor.chain().toggleHighlight().focus().run(),
        onInit: (editor, _view, element) => {
          const container = document.createElement("div");
          container.classList.add("tiptap-fm-color-picker");

          const section1 = document.createElement("div");
          const section2 = document.createElement("div");
          section1.classList.add("tiptap-fm-color-picker-section");
          section2.classList.add("tiptap-fm-color-picker-section");

          for (const [key, name] of [["e", "Gray"], ["f", "Brown"], ["o", "Orange"], ["y", "Yellow"], ["g", "Green"], ["b", "Blue"], ["p", "Purple"], ["q", "Pink"], ["r", "Red"]]) {
            const button1 = document.createElement("button");
            button1.textContent = "A";
            button1.setAttribute("data-color", key);
            const popover1 = document.createElement("span");
            popover1.classList.add("tiptap-fm-button-popover");
            popover1.textContent = name;
            tippy(button1, {
              content: popover1,
              arrow: false,
              theme: "tiptap-dark",
              animation: "shift-away",
              duration: [200, 150],
            });
            button1.addEventListener("click", (e) => {
              e.stopPropagation();
              editor.chain().toggleHighlight({ color: key }).focus().run();
            });
            section1.append(button1);

            const button2 = document.createElement("button");
            button2.textContent = "A";
            button2.setAttribute("data-color", `b${key}`);
            const popover2 = document.createElement("span");
            popover2.classList.add("tiptap-fm-button-popover");
            popover2.textContent = `Background ${name}`;
            tippy(button2, {
              content: popover2,
              arrow: false,
              theme: "tiptap-dark",
              animation: "shift-away",
              duration: [200, 150],
            });
            button2.addEventListener("click", (e) => {
              e.stopPropagation();
              editor.chain().toggleHighlight({ color: `b${key}` }).focus().run();
            });
            section2.append(button2);
          }

          container.append(section1);
          container.append(section2);
          tippy(element, {
            appendTo: () => element,
            content: container,
            arrow: false,
            interactive: true,
            theme: "tiptap",
            placement: "bottom",
            maxWidth: "none",
            animation: "shift-away",
            duration: [200, 150],
          });
        },
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
});
