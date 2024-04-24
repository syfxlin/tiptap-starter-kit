import { Node, defaultBlockAt, mergeAttributes } from "@tiptap/core";
import { Selection } from "@tiptap/pm/state";
import { MarkdownNode, NodeMarkdownStorage } from "../extensions/markdown";

export interface DetailsSummaryOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
  };
}

export const DetailsSummary = Node.create<DetailsSummaryOptions>({
  name: "detailsSummary",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: true,
  selectable: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Details Summary",
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "containerDirective" && node.name === this.name,
          apply: (state, node, type) => {
            const nodes: Array<MarkdownNode> = [];
            for (const item of node.children ?? []) {
              if (item.type === "paragraph") {
                if (item.children) {
                  nodes.push(...item.children);
                }
              } else if (item) {
                nodes.push(item);
              }
            }
            state.openNode(type, node.attributes).next(nodes).closeNode();
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
  parseHTML() {
    return [
      {
        tag: "summary",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const state = editor.state;
        const selection = state.selection;
        if (selection.$anchor.parent.type.name !== this.name) {
          return false;
        }
        if (selection.$anchor.parentOffset !== 0) {
          return false;
        }
        return editor.chain().unsetDetails().focus().run();
      },
      Enter: ({ editor }) => {
        const view = editor.view;
        const state = editor.state;

        const head = state.selection.$head;
        if (head.parent.type.name !== this.name) {
          return false;
        }

        // @ts-expect-error
        const hasOffset = view.domAtPos(head.after() + 1).node.offsetParent !== null;
        const findNode = hasOffset ? state.doc.nodeAt(head.after()) : head.node(-2);
        if (!findNode) {
          return false;
        }

        const indexAfter = hasOffset ? 0 : head.indexAfter(-1);
        const nodeType = defaultBlockAt(findNode.contentMatchAt(indexAfter));
        if (!nodeType || !findNode.canReplaceWith(indexAfter, indexAfter, nodeType)) {
          return false;
        }

        const defaultNode = nodeType.createAndFill();
        if (!defaultNode) {
          return false;
        }

        const tr = state.tr;
        const after = hasOffset ? head.after() + 1 : head.after(-1);
        tr.replaceWith(after, after, defaultNode);
        tr.setSelection(Selection.near(tr.doc.resolve(after), 1));

        tr.scrollIntoView();
        view.dispatch(tr);

        return true;
      },
    };
  },
});
