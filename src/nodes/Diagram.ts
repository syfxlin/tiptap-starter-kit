import { Node, textblockTypeInputRule } from "@tiptap/core";
import { editorView } from "../extensions/float-menu/utils";
import { css } from "@emotion/css";
import mermaid from "mermaid";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { textContent } from "./utils";

mermaid.initialize({
  startOnLoad: false,
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    diagram: {
      setDiagram: (code: string) => ReturnType;
    };
  }
}

export type DiagramOptions = {
  dictionary: {
    empty: string;
    error: string;
  };
};

export const Diagram = Node.create<DiagramOptions>({
  name: "diagram",
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
      rendered.id = `id-${Math.random().toString(36).substring(2, 10)}`;
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
            rendered.innerHTML = mermaid.render(rendered.id, code);
          }
        } catch (e) {
          const error = document.querySelector(`#d${rendered.id}`);
          if (error) {
            error.remove();
          }
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
      parser: {
        match: (node) =>
          node.type === "containerDirective" && node.name === this.name,
        runner: (state, node, type) => {
          state.openNode(type).addText(textContent(node)).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "containerDirective",
              name: this.name,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setDiagram:
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
        find: /^```diagram$/,
        type: this.type,
      }),
    ];
  },
});
