import katex from "katex";
import remarkMath from "remark-math";
import { InputRule, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { icon } from "../utils/icons";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (code: string) => ReturnType;
    };
  }
}

export interface MathInlineOptions {
  dictionary: {
    empty: string;
    code: string;
    help: string;
  };
}

export const MathInline = Node.create<MathInlineOptions>({
  name: "mathInline",
  inline: true,
  group: "inline",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      value: {
        default: "",
      },
    };
  },
  addOptions() {
    return {
      dictionary: {
        empty: "Add a Tex equation",
        code: "Enter or paste the equation",
        help: "Help",
      },
    };
  },
  addStorage() {
    return {
      processor: processor => processor.use(remarkMath),
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
    } satisfies NodeMarkdownStorage;
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
  renderHTML({ node }) {
    return [
      "span",
      { "data-type": this.name },
      node.attrs.value,
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      const render = (code: string) => {
        try {
          if (!code) {
            dom.innerHTML = this.options.dictionary.empty;
          } else {
            katex.render(code, dom);
          }
        } catch (e) {
          const span = document.createElement("span");
          span.classList.add("ProseMirror-error");
          span.textContent = (e as Error).message;
          dom.append(span);
        }
      };
      render(node.attrs.value);
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          render(updatedNode.attrs.value);
          return true;
        },
      };
    };
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
        view: () => new FloatMenuView({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.isActive(this.name),
          tippy: ({ options }) => ({ ...options, onMount: i => i.popper.querySelector("input")?.focus() }),
          onInit: ({ view, editor, element }) => {
            const code = view.createInput({
              name: this.options.dictionary.code,
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
              name: this.options.dictionary.help,
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
