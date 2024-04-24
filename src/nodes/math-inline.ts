import katex from "katex";
import remarkMath from "remark-math";
import { InputRule, Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { icon } from "../utils/icons";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { InnerRenderView } from "../extensions/node-view/inner-render";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (code: string) => ReturnType;
    };
  }
}

export interface MathInlineOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    emptyMath: string;
    inputMath: string;
    inputHelp: string;
  };
}

export const MathInline = Node.create<MathInlineOptions>({
  name: "mathInline",
  inline: true,
  group: "inline",
  atom: true,
  draggable: true,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Math Inline",
        emptyMath: "Add a Tex equation",
        inputMath: "Enter or paste the equation",
        inputHelp: "Help",
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "inlineMath",
          apply: (state, node, type) => {
            state.addNode(type, { value: node.value });
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.addNode({
              type: "inlineMath",
              value: node.attrs.value,
            });
          },
        },
        hooks: {
          beforeInit: processor => processor.use(remarkMath),
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("math"),
            keywords: "mathinline,sxgs,hngs",
            action: editor => editor.chain().setMathInline("E = mc^2").focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
  addAttributes() {
    return {
      value: {
        default: "",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
        preserveWhitespace: "full",
        getAttrs: node => ({ value: (node as HTMLElement).textContent }),
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      node.attrs.value,
    ];
  },
  addNodeView() {
    return InnerRenderView.create({
      tag: "span",
      HTMLAttributes: this.options.HTMLAttributes,
      onRender: ({ view }) => {
        try {
          if (!view.node.attrs.value) {
            const span = document.createElement("span");
            span.classList.add("ProseMirror-empty");
            span.textContent = this.options.dictionary.inputMath;
            view.$root.innerHTML = span.outerHTML;
          } else {
            katex.render(view.node.attrs.value, view.$root);
          }
        } catch (e) {
          const span = document.createElement("span");
          span.classList.add("ProseMirror-error");
          span.textContent = (e as Error).message;
          view.$root.innerHTML = span.outerHTML;
        }
      },
    });
  },
  addCommands() {
    return {
      setMathInline: (code) => {
        return ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              value: code,
            },
          });
      },
    };
  },
  addInputRules() {
    return [
      new InputRule({
        find: /\$(.+)\$/,
        handler: ({ state, range, match }) => {
          const { from, to } = range;
          const $start = state.doc.resolve(from);
          const index = $start.index();
          const $end = state.doc.resolve(to);
          if (!$start.parent.canReplaceWith(index, $end.index(), this.type)) {
            return null;
          }
          const value = match[1];
          state.tr.replaceRangeWith(from, to, this.type.create({ value }, this.type.schema.text(value)));
        },
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: FloatMenuView.create({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.isActive(this.name),
          tippy: ({ options }) => ({ ...options, onMount: i => i.popper.querySelector("input")?.focus() }),
          onInit: ({ view, editor, element }) => {
            const code = view.createInput({
              name: this.options.dictionary.inputMath,
              onInput: (value) => {
                editor.chain()
                  .updateAttributes(this.name, { value })
                  .setNodeSelection(editor.state.selection.from)
                  .run();
              },
              onEnter: (value) => {
                editor.chain()
                  .updateAttributes(this.name, { value })
                  .setTextSelection(editor.state.selection.from + 1)
                  .focus()
                  .run();
              },
              onBoundary: (boundary, value) => {
                editor.chain()
                  .updateAttributes(this.name, { value })
                  .setTextSelection(editor.state.selection.from + (boundary === "left" ? -1 : 1))
                  .focus()
                  .run();
              },
            });
            const help = view.createButton({
              name: this.options.dictionary.inputHelp,
              view: icon("help"),
              onClick: () => window.open("https://katex.org/"),
            });

            code.input.classList.add("ProseMirror-code");
            element.append(code.input);
            element.append(help.button);
          },
          onUpdate: ({ editor, element }) => {
            const code = element.querySelector("input") as HTMLInputElement;
            if (code) {
              code.value = editor.getAttributes(this.name)?.value ?? "";
            }
          },
        }),
      }),
    ];
  },
});
