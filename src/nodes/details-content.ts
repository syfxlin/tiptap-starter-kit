import { Node, defaultBlockAt, findParentNode, mergeAttributes } from "@tiptap/core";
import { Selection } from "@tiptap/pm/state";
import { NodeMarkdownStorage } from "../extensions/markdown";

export interface DetailsContentOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
  };
}

export const DetailsContent = Node.create<DetailsContentOptions>({
  name: "detailsContent",
  group: "block",
  content: "block*",
  defining: true,
  selectable: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Details Content",
      },
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
  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const view = editor.view;
        const state = editor.state;
        const selection = state.selection;

        const findNode = findParentNode(node => node.type.name === this.name)(selection);
        if (!selection.empty || !findNode || !findNode.node.childCount) {
          return false;
        }

        const childCount = findNode.node.childCount;
        if (!(childCount === selection.$from.index(findNode.depth) + 1)) {
          return false;
        }

        const fillNode = findNode.node.type.contentMatch.defaultType?.createAndFill();
        if (!fillNode) {
          return false;
        }

        const lastNode = findNode.node.child(childCount - 1);
        if (!lastNode.eq(fillNode)) {
          return false;
        }

        const rootNode = selection.$from.node(-3);
        if (!rootNode) {
          return false;
        }

        const indexAfter = selection.$from.indexAfter(-3);
        const nodeType = defaultBlockAt(rootNode.contentMatchAt(indexAfter));
        if (!nodeType || !rootNode.canReplaceWith(indexAfter, indexAfter, nodeType)) {
          return false;
        }

        const defaultNode = nodeType.createAndFill();
        if (!defaultNode) {
          return false;
        }

        const tr = state.tr;
        const after = selection.$from.after(-2);
        tr.replaceWith(after, after, defaultNode);
        tr.setSelection(Selection.near(tr.doc.resolve(after), 1));

        const from = state.doc.resolve(findNode.pos + 1).posAtIndex(childCount - 1, findNode.depth);
        const to = from + lastNode.nodeSize;
        tr.delete(from, to);
        tr.scrollIntoView();
        view.dispatch(tr);

        return true;
      },
    };
  },
});
