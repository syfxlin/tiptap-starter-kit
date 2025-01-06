import { markInputRule, markPasteRule } from "@tiptap/core";
import { Highlight as THighlight, HighlightOptions as THighlightOptions } from "@tiptap/extension-highlight";
import tippy from "tippy.js";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { DecorationData, remarkDecoration } from "../extensions/markdown/plugins/decoration";
import { colors } from "../utils/colors";
import { icon } from "../utils/icons";

const INPUT_REGEX = /(?:^|[^=])(==(?!\s+==)([^=]+)==)$/;
const PASTE_REGEX = /(?:^|[^=])(==(?!\s+==)([^=]+)==(?!\s+==))/g;

export interface HighlightOptions extends Omit<THighlightOptions, "multicolor"> {
  dictionary: Record<typeof colors[number][0], string> & {
    name: string;
  };
}

export const Highlight = THighlight.extend<HighlightOptions>({
  name: "highlight",
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Highlight",
        none: "None",
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
            render: ({ editor, view, root }) => {
              const node = view.createButton({
                id: this.name,
                name: this.options.dictionary.name,
                icon: icon("highlight"),
                shortcut: "Mod-Shift-H",
              });

              // color picker
              const container1 = document.createElement("div");
              const container2 = document.createElement("div");
              for (const color of [...colors.map(i => i[0]), ...colors.map(i => `b-${i[0]}`)]) {
                const button = document.createElement("button");
                button.innerHTML = `<span>A</span>`;
                button.setAttribute("data-color", color);
                const popover = document.createElement("span");
                popover.classList.add("ProseMirror-fm-button-popover");
                if (color.startsWith("b-")) {
                  // @ts-expect-error
                  popover.innerHTML = `Background ${this.options.dictionary[color.replace("b-", "")]}`;
                } else {
                  // @ts-expect-error
                  popover.innerHTML = this.options.dictionary[color];
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
                  if (color === "none") {
                    editor.chain().unsetHighlight().run();
                  } else {
                    editor.chain().setHighlight({ color }).focus().run();
                  }
                });
                if (color.startsWith("b-")) {
                  container2.append(button);
                } else {
                  container1.append(button);
                }
              }

              const pick = document.createElement("div");
              pick.classList.add("ProseMirror-fm-color-picker");
              pick.append(container1);
              pick.append(container2);

              tippy(node, {
                appendTo: () => node,
                content: pick,
                arrow: false,
                interactive: true,
                hideOnClick: false,
                theme: "ProseMirror",
                placement: "bottom-start",
                maxWidth: "none",
                animation: "shift-away",
                duration: [200, 150],
                onShow: (i) => {
                  const color = editor.getAttributes(this.name)?.color || "none";
                  for (const item of i.popper.querySelectorAll(`[data-color]`)) {
                    if (item.getAttribute("data-color") === color) {
                      item.innerHTML = icon("check");
                    } else {
                      item.innerHTML = `<span>A</span>`;
                    }
                  }
                },
              });

              if (editor.isActive(this.name)) {
                node.setAttribute("data-active", "true");
              }

              root.append(node);
            },
            update: ({ editor, root }) => {
              const node = root.firstElementChild!;

              if (editor.isActive(this.name)) {
                node.setAttribute("data-active", "true");
              } else {
                node.removeAttribute("data-active");
              }
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
