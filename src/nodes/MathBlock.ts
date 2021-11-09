import { Node, textblockTypeInputRule } from "@tiptap/core";
import { editorView } from "../extensions/float-menu/utils";
import katex from "katex";
import { css } from "@emotion/css";
import remarkMath from "remark-math";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (code: string) => ReturnType;
    };
  }
}

export type MathBlockOptions = {
  dictionary: {
    empty: string;
    error: string;
  };
};

export const MathBlock = Node.create<MathBlockOptions>({
  name: "mathBlock",
  content: "text*",
  group: "block",
  marks: "",
  defining: true,
  atom: true,
  code: true,
  isolating: true,
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
  addOptions() {
    return {
      dictionary: {
        empty: "(empty)",
        error: "(error)",
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const innerEditor = editorView(editor.view, getPos);
      let currentNode = node;

      const dom = document.createElement("div");

      const rendered = document.createElement("div");
      rendered.classList.add(css`
        display: flex;
        justify-content: center;
        padding: 1em 0;
      `);

      dom.append(innerEditor.dom);

      const render = (code: string) => {
        try {
          if (!code) {
            rendered.innerHTML = this.options.dictionary.empty;
          } else {
            katex.render(code, rendered);
          }
        } catch (e) {
          rendered.innerHTML = this.options.dictionary.error;
        } finally {
          dom.append(rendered);
        }
      };

      render(node.textContent);
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          currentNode = updatedNode;
          innerEditor.update(updatedNode);
          render(updatedNode.textContent);
          return true;
        },
        selectNode: () => {
          if (!editor.isEditable) return;
          innerEditor.open(currentNode);
          dom.classList.add("ProseMirror-selectednode");
        },
        deselectNode: () => {
          innerEditor.close();
          dom.classList.remove("ProseMirror-selectednode");
        },
        stopEvent: (event) => {
          return innerEditor.stopEvent(event);
        },
        ignoreMutation: () => true,
      };
    };
  },
  addStorage() {
    return {
      remark: (processor) => processor.use(remarkMath),
      parser: {
        match: (node) => node.type === "math",
        runner: (state, node, type) => {
          const code = node.value as string;
          state.openNode(type).addText(code).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "math",
            value: node.textContent,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setMathBlock:
        (code) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: code,
              },
            ],
          }),
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
