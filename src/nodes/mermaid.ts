import mermaid from "mermaid";
import { Node, mergeAttributes, textblockTypeInputRule } from "@tiptap/core";
import { MarkdownNode, NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";
import { InnerEditorView } from "../extensions/node-view/inner-editor";

import { debounce } from "../utils/functions";

mermaid.initialize({
  startOnLoad: false,
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    diagram: {
      setMermaid: (code: string) => ReturnType;
    };
  }
}

export interface MermaidOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputHelp: string;
    inputGraph: string;
  };
}

export const Mermaid = Node.create<MermaidOptions>({
  name: "mermaid",
  group: "block",
  marks: "",
  content: "text*",
  atom: true,
  code: true,
  defining: true,
  isolating: true,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Mermaid",
        inputHelp: "Help",
        inputGraph: "Enter or paste the mermaid code",
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "containerDirective" && node.name === this.name,
          apply: (state, node, type) => {
            const collect = (node: MarkdownNode): string => {
              return (node.children ?? []).reduce((a, i) => {
                if (i.type === "text") {
                  return a + i.value;
                } else {
                  return a + collect(i);
                }
              }, "");
            };
            state.openNode(type).addText(collect(node)).closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state
              .openNode({
                type: "containerDirective",
                name: this.name,
              })
              .next(node.content)
              .closeNode();
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("mermaid"),
            keywords: "mermaid,graph",
            action: editor => editor.chain().setMermaid("graph TD;\n  A-->B;  A-->C;\n  B-->D;\n  C-->D;").focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
        preserveWhitespace: "full",
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      node.textContent,
    ];
  },
  addNodeView() {
    const render = debounce(300, (code: string, node: HTMLElement) => {
      const dom = document.createElement("div");
      dom.id = `${this.name}-${Math.random().toString(36).substring(2, 10)}`;
      mermaid.render(dom.id, code)
        .then(({ svg, bindFunctions }) => {
          dom.innerHTML = svg;
          bindFunctions?.(dom);
          node.innerHTML = dom.outerHTML;
        })
        .catch((reason) => {
          document.querySelector(`#d${dom.id}`)?.remove();
          node.classList.add("ProseMirror-card-error");
          node.innerHTML = reason;
        });
    });
    return InnerEditorView.create({
      HTMLAttributes: this.options.HTMLAttributes,
      onRender: ({ view }) => {
        view.$preview.classList.remove("ProseMirror-card-empty");
        view.$preview.classList.remove("ProseMirror-card-error");
        if (!view.node.textContent) {
          view.$preview.classList.add("ProseMirror-card-empty");
          view.$preview.innerHTML = this.options.dictionary.inputGraph;
        } else {
          render(view.node.textContent, view.$preview);
        }
      },
    });
  },
  addCommands() {
    return {
      setMermaid: (code) => {
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
        find: /^:::mermaid$/,
        type: this.type,
      }),
    ];
  },
});
