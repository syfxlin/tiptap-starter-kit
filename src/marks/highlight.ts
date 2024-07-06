import { Highlight as THighlight, HighlightOptions as THighlightOptions } from "@tiptap/extension-highlight";
import tippy from "tippy.js";
import { markInputRule, markPasteRule } from "@tiptap/core";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { DecorationData, remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { icon } from "../utils/icons";
import { colors } from "../utils/colors";

const INPUT_REGEX = /(?:^|[^=])(==(?!\s+==)([^=]+)==)$/;
const PASTE_REGEX = /(?:^|[^=])(==(?!\s+==)([^=]+)==(?!\s+==))/g;

export interface HighlightOptions extends Omit<THighlightOptions, "multicolor"> {
  dictionary: Record<typeof colors[number][0], string> & {
    name: string;
  };
}

export const Highlight = THighlight.extend<HighlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Highlight",
        gray: "Gray",
        slate: "Slate",
        tomato: "Tomato",
        red: "Red",
        ruby: "Ruby",
        crimson: "Crimson",
        pink: "Pink",
        plum: "Plum",
        purple: "Purple",
        violet: "Violet",
        iris: "Iris",
        indigo: "Indigo",
        blue: "Blue",
        cyan: "Cyan",
        teal: "Teal",
        jade: "Jade",
        green: "Green",
        bronze: "Bronze",
        gold: "Gold",
        brown: "Brown",
        orange: "Orange",
        amber: "Amber",
        yellow: "Yellow",
        lime: "Lime",
        mint: "Mint",
        sky: "Sky",
      },
    };
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: e => e.getAttribute("data-color"),
        renderHTML: a => a.color ? { "data-color": a.color } : {},
      },
    };
  },
  addStorage() {
    const mapping1 = new Map<string, string>();
    const mapping2 = new Map<string, string>();
    for (const [c, k] of colors) {
      mapping1.set(k, c);
      mapping1.set(`b${k}`, `b-${c}`);
      mapping2.set(c, k);
      mapping2.set(`b-${c}`, `b${k}`);
    }
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "highlight",
          apply: (state, node, type) => {
            const value = (node.data as DecorationData)?.flags ?? "";
            state.openMark(type, { color: mapping1.get(value) });
            state.next(node.children);
            state.closeMark(type);
          },
        },
        serializer: {
          match: mark => mark.type.name === this.name,
          apply: (state, mark) => {
            const value = mark.attrs.color ?? "";
            state.withMark(mark, {
              type: "highlight",
              data: { flags: mapping2.get(value) },
            });
          },
        },
        hooks: {
          beforeInit: processor => processor.use(remarkDecoration("highlight", "=", true)),
        },
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("highlight"),
            shortcut: "Mod-Shift-H",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleHighlight().focus().run(),
            onInit: ({ editor, element }) => {
              const container = document.createElement("div");
              container.classList.add("ProseMirror-fm-color-picker");
              for (const color of [...colors.map(i => i[0]), ...colors.map(i => `b-${i[0]}`)]) {
                const button = document.createElement("button");
                button.textContent = "A";
                button.setAttribute("data-color", color);
                const popover = document.createElement("span");
                popover.classList.add("ProseMirror-fm-button-popover");
                if (color.startsWith("b-")) {
                  // @ts-expect-error
                  popover.textContent = `Background ${this.options.dictionary[color.replace("b-", "")]}`;
                } else {
                  // @ts-expect-error
                  popover.textContent = this.options.dictionary[color];
                }
                tippy(button, {
                  appendTo: () => document.body,
                  content: popover,
                  arrow: false,
                  theme: "ProseMirror-dark",
                  animation: "shift-away",
                  duration: [200, 150],
                });
                button.addEventListener("click", (e) => {
                  e.stopPropagation();
                  editor.chain().toggleHighlight({ color }).focus().run();
                });
                container.append(button);
              }
              tippy(element, {
                appendTo: () => element,
                content: container,
                arrow: false,
                interactive: true,
                theme: "ProseMirror",
                placement: "bottom",
                maxWidth: "none",
                animation: "shift-away",
                duration: [200, 150],
              });
            },
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
  addInputRules() {
    return [
      markInputRule({
        find: INPUT_REGEX,
        type: this.type,
      }),
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: PASTE_REGEX,
        type: this.type,
      }),
    ];
  },
});
