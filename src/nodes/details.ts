import { Node, mergeAttributes, wrappingInputRule } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown";

export interface DetailsOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
  };
}

export const Details = Node.create<DetailsOptions>({
  name: "details",
  group: "block",
  content: "detailsSummary detailsContent",
  defining: true,
  isolating: true,
  allowGapCursor: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Details",
      },
    };
  },
  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: e => e.getAttribute("open"),
        renderHTML: a => a.open ? { open: "" } : {},
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "details",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addNodeView() {
    return ({ node, editor, getPos, HTMLAttributes }) => {
      const parent = document.createElement("div");
      const toggle = document.createElement("button");
      const content = document.createElement("div");

      for (const [key, value] of Object.entries(mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes))) {
        if (value !== undefined && value !== null) {
          parent.setAttribute(key, value);
        }
      }

      toggle.textContent = "open";
      toggle.addEventListener("click", () => {
        if (editor.isEditable && typeof getPos === "function") {
          console.log("click");
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
              ...node.attrs,
              open: !node.attrs.open,
            }),
          );
        }
      });

      parent.append(toggle);
      parent.append(content);
      return {
        dom: parent,
        contentDOM: content,
      };
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "containerDirective" && node.name === this.name,
          apply: (state, node, type) => {
            state.openNode(type, node.attributes).next(node.children).closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
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
      },
    } satisfies NodeMarkdownStorage;
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
