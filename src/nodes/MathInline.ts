import { InputRule, isNodeActive, Node } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import remarkMath from "remark-math";
import katex from "katex";
import "katex/dist/katex.css";
import { Plugin, PluginKey } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { buttonView, inputView } from "../extensions/float-menu/utils";
import { Help } from "@icon-park/svg";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (code: string) => ReturnType;
    };
  }
}

export type MathInlineOptions = {
  dictionary: {
    empty: string;
    error: string;
    inputMath: string;
    openHelp: string;
  };
};

export const MathInline = Node.create<MathInlineOptions>({
  name: "mathInline",
  inline: true,
  group: "inline",
  draggable: true,
  atom: true,
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
        getAttrs: (node) => ({
          value: (node as HTMLElement).textContent,
        }),
      },
    ];
  },
  renderHTML({ node }) {
    return ["span", { "data-type": this.name }, node.attrs.value];
  },
  addOptions() {
    return {
      dictionary: {
        empty: "(empty)",
        error: "(error)",
        inputMath: "输入或粘贴公式",
        openHelp: "帮助",
      },
    };
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
          dom.innerHTML = this.options.dictionary.error;
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
  addStorage() {
    return {
      remark: (processor) => processor.use(remarkMath),
      parser: {
        match: (node) => node.type === "inlineMath",
        runner: (state, node, type) => {
          const code = node.value as string;
          state.addNode(type, {
            value: code,
          });
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "inlineMath",
            value: node.attrs.value,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setMathInline:
        (code) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              value: code,
            },
          }),
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
          return state.tr.replaceRangeWith(
            from,
            to,
            this.type.create(
              {
                value,
              },
              this.type.schema.text(value)
            )
          );
        },
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}FloatMenu`),
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            shouldShow: ({ editor }) =>
              editor.isEditable && isNodeActive(editor.state, this.name),
            init: (dom, editor) => {
              const code = inputView({
                placeholder: this.options.dictionary.inputMath,
              });
              code.input.addEventListener("input", () => {
                const pos = editor.state.selection.from;
                editor
                  .chain()
                  .updateAttributes(this.name, {
                    value: code.input.value,
                  })
                  .setNodeSelection(pos)
                  .run();
              });

              const helper = buttonView({
                name: this.options.dictionary.openHelp,
                icon: Help({}),
              });
              helper.button.addEventListener("click", () => {
                window.open("https://katex.org/");
              });

              dom.append(code.input);
              dom.append(helper.button);
              dom.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  editor
                    .chain()
                    .setTextSelection(editor.state.selection.from + 1)
                    .focus()
                    .run();
                }
              });
            },
            update: (dom, { editor }) => {
              const attrs = editor.getAttributes(this.name);
              const code = dom.querySelector("input") as HTMLInputElement;
              code.value = attrs.value || "";
            },
            tippyOptions: {
              onMount(instance) {
                instance.popper.querySelector("input")?.focus();
              },
            },
          }),
      }),
    ];
  },
});
