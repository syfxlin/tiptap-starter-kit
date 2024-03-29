import katex from "katex";
import remarkMath from "remark-math";
import { Node, textblockTypeInputRule } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { InnerEditorView } from "../extensions/node-view/inner-editor";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (code: string) => ReturnType;
    };
  }
}

export interface MathBlockOptions {
  dictionary: {
    emptyMath: string;
    inputMath: string;
    inputHelp: string;
  };
}

export const MathBlock = Node.create<MathBlockOptions>({
  name: "mathBlock",
  group: "block",
  marks: "",
  content: "text*",
  atom: true,
  code: true,
  defining: true,
  isolating: true,
  addOptions() {
    return {
      dictionary: {
        emptyMath: "Add a Tex equation",
        inputMath: "Enter or paste the equation",
        inputHelp: "Help",
      },
    };
  },
  addStorage() {
    return {
      processor: processor => processor.use(remarkMath),
      parser: {
        match: node => node.type === "math",
        apply: (state, node, type) => {
          const code = node.value as string;
          state.openNode(type).addText(code).closeNode();
        },
      },
      serializer: {
        match: node => node.type.name === this.name,
        apply: (state, node) => {
          state.addNode({
            type: "math",
            value: node.textContent,
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
      },
    ];
  },
  renderHTML({ node }) {
    return ["span", { "data-type": this.name }, node.textContent];
  },
  addNodeView() {
    return InnerEditorView.create({
      onRender: ({ view }) => {
        try {
          if (!view.node.textContent) {
            view.$preview.innerHTML = this.options.dictionary.inputMath;
          } else {
            katex.render(view.node.textContent, view.$preview);
          }
        } catch (e) {
          const span = document.createElement("span");
          span.classList.add("ProseMirror-error");
          span.textContent = (e as Error).message;
          view.$preview.innerHTML = span.outerHTML;
        }
      },
    });
  },
  addCommands() {
    return {
      setMathBlock: (code) => {
        return ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: code,
              },
            ],
          });
      },
    };
  },
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^\$\$\s$/,
        type: this.type,
      }),
    ];
  },
});
