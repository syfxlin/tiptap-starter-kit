import { InputRule, mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import katex from "katex";
import remarkMath from "remark-math";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { InnerRenderView } from "../extensions/node-view/inner-render";
import { icon } from "../utils/icons";

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
    inputDone: string;
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
        inputDone: "Done",
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
            span.classList.add("ProseMirror-info");
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
          tippy: {
            placement: "bottom",
          },
          show: ({ editor }) => {
            return editor.isEditable && editor.isActive(this.name);
          },
          onInit: ({ view, editor, root }) => {
            const code = view.createTextarea({
              id: "code",
              name: this.options.dictionary.inputMath,
              classes: ["ProseMirror-mono"],
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

            const done = view.createButton({
              id: "done",
              name: this.options.dictionary.inputDone,
              icon: icon("check"),
              onClick: () => {
                editor.chain()
                  .updateAttributes(this.name, { value: code.value })
                  .setTextSelection(editor.state.selection.from + 1)
                  .focus()
                  .run();
              },
            });

            const help = view.createButton({
              id: "help",
              name: this.options.dictionary.inputHelp,
              icon: icon("help"),
              onClick: () => {
                window.open("https://katex.org/docs/supported.html");
              },
            });

            const form = view.createForm();
            const action = view.createAction();
            root.append(form);
            form.append(code);
            form.append(action);
            action.append(done);
            action.append(help);
          },
          onMount: ({ root }) => {
            const code = root.querySelector("textarea") as HTMLTextAreaElement;
            if (code) {
              code.focus();
            }
          },
          onUpdate: ({ editor, root }) => {
            const code = root.querySelector("textarea") as HTMLTextAreaElement;
            if (code) {
              code.value = editor.getAttributes(this.name)?.value ?? "";
            }
          },
        }),
      }),
    ];
  },
});
