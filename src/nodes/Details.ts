import { Node, wrappingInputRule } from "@tiptap/core";
import { css } from "@emotion/css";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      setDetails: (options: { open?: boolean; summary?: string }) => ReturnType;
    };
  }
}

export type DetailsOptions = {
  dictionary: {
    empty: string;
  };
};

export const Details = Node.create<DetailsOptions>({
  name: "details",
  group: "block",
  content: "block+",
  defining: true,
  addOptions() {
    return {
      dictionary: {
        empty: "详细信息",
      },
    };
  },
  addAttributes() {
    return {
      open: {
        default: false,
      },
      summary: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "details",
        getAttrs: (node) => {
          const dom = node as HTMLElement;
          const summaryDOM = dom.querySelector("summary");
          let summary: null | string = null;
          if (summaryDOM) {
            summary = summaryDOM.textContent;
            summaryDOM.remove();
          }
          return {
            summary,
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const dom = document.createElement("details");
    dom.open = node.attrs.open;
    if (node.attrs.summary !== null) {
      const summary = document.createElement("summary");
      summary.textContent = node.attrs.summary;
      dom.append(summary);
    }
    const contentDOM = document.createElement("div");
    dom.append(contentDOM);
    return {
      dom,
      contentDOM,
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("details");
      dom.open = node.attrs.open;

      const summary = document.createElement("summary");
      summary.contentEditable = "false";
      summary.addEventListener("click", (e) => {
        if (typeof getPos === "function") {
          editor
            .chain()
            .setNodeSelection(getPos())
            .updateAttributes(this.name, {
              open: !node.attrs.open,
            })
            .run();
        }
      });

      const input = document.createElement("input");
      input.classList.add(css`
        appearance: none;
        background-color: transparent;
        border: 0;
        outline: 0;
        width: 50%;
      `);
      input.placeholder = this.options.dictionary.empty;
      input.value = node.attrs.summary;
      input.addEventListener("keydown", (e) => {
        e.stopPropagation();
      });
      input.addEventListener("change", () => {
        if (typeof getPos === "function") {
          editor
            .chain()
            .setNodeSelection(getPos())
            .updateAttributes(this.name, {
              summary: input.value,
            })
            .run();
        }
      });
      input.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      summary.append(input);

      const contentDOM = document.createElement("div");
      dom.append(summary);
      dom.append(contentDOM);
      return {
        dom,
        contentDOM,
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
          state.openNode(type, node.attributes).next(node.children).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "containerDirective",
              name: this.name,
              attributes: node.attrs,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setDetails:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
            content: [
              {
                type: "paragraph",
              },
            ],
          }),
    };
  },
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^:::details\s$/,
        type: this.type,
      }),
    ];
  },
});
