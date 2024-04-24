import { Node, mergeAttributes, textblockTypeInputRule } from "@tiptap/core";
import { encode } from "plantuml-encoder";
import { MarkdownNode, NodeMarkdownStorage } from "../extensions/markdown";
import { icon } from "../utils/icons";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { InnerEditorView } from "../extensions/node-view/inner-editor";

import { debounce } from "../utils/functions";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    plantuml: {
      setPlantuml: (code: string) => ReturnType;
    };
  }
}

export interface PlantumlOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputHelp: string;
    inputGraph: string;
  };
}

export const Plantuml = Node.create<PlantumlOptions>({
  name: "plantuml",
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
        name: "PlantUML",
        inputHelp: "Help",
        inputGraph: "Enter or paste the plantuml code",
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
            icon: icon("plantuml"),
            keywords: "plantuml,graph",
            action: editor => editor.chain().setPlantuml("@startuml\nBob -> Alice : hello\n@enduml").focus().run(),
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
      try {
        const dom = document.createElement("img");
        dom.src = `https://www.plantuml.com/plantuml/svg/${encode(code)}`;
        dom.alt = code;
        node.innerHTML = dom.outerHTML;
      } catch (e) {
        node.classList.add("ProseMirror-card-error");
        node.innerHTML = (e as Error).message;
      }
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
      setPlantuml: (code) => {
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
        find: /^:::plantuml$/,
        type: this.type,
      }),
    ];
  },
});
