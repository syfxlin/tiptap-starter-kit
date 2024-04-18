import { Node, findChildren, findParentNode, mergeAttributes, wrappingInputRule } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { icon } from "../utils/icons";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { setAttributes } from "../utils/editor";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      setDetails: () => ReturnType;
      unsetDetails: () => ReturnType;
      toggleDetails: () => ReturnType;
    };
  }
}

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
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("details"),
            shortcut: "Mod-Alt-D",
            keywords: "details,zdnl",
            action: editor => editor.chain().toggleDetails().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
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
      const button = document.createElement("button");
      const content = document.createElement("div");

      for (const [key, value] of Object.entries(mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes))) {
        if (value !== undefined && value !== null) {
          parent.setAttribute(key, value);
        }
      }

      const toggle = document.createElement("div");
      toggle.innerHTML = icon(node.attrs.open ? "down-line" : "right-line");
      button.append(toggle);
      button.addEventListener("click", () => {
        setAttributes(editor, getPos, { ...node.attrs, open: !node.attrs.open });
      });

      parent.append(button);
      parent.append(content);
      return {
        dom: parent,
        contentDOM: content,
      };
    };
  },
  addCommands() {
    return {
      setDetails: () => {
        return ({ state, chain }) => {
          const range = state.selection.$from.blockRange(state.selection.$to);
          if (!range) {
            return false;
          }

          const slice = state.doc.slice(range.start, range.end);
          if (!state.schema.nodes.detailsContent.contentMatch.matchFragment(slice.content)) {
            return false;
          }

          return chain()
            .insertContentAt(
              {
                from: range.start,
                to: range.end,
              },
              {
                type: this.name,
                attrs: {
                  open: true,
                },
                content: [
                  {
                    type: "detailsSummary",
                  },
                  {
                    type: "detailsContent",
                    content: slice.toJSON()?.content ?? [],
                  },
                ],
              },
            )
            .setTextSelection(range.start + 2)
            .run();
        };
      },
      unsetDetails: () => {
        return ({ state, chain }) => {
          const parent = findParentNode(node => node.type === this.type)(state.selection);
          if (!parent) {
            return false;
          }

          const summary = findChildren(parent.node, node => node.type.name === "detailsSummary");
          const content = findChildren(parent.node, node => node.type.name === "detailsContent");
          if (!summary.length || !content.length) {
            return false;
          }

          const range = { from: parent.pos, to: parent.pos + parent.node.nodeSize };
          const defaultType = state.doc.resolve(range.from).parent.type.contentMatch.defaultType;
          return chain()
            .insertContentAt(
              range,
              [
                defaultType?.create(null, summary[0].node.content).toJSON(),
                ...(content[0].node.content.toJSON() ?? []),
              ],
            )
            .setTextSelection(range.from + 1)
            .run();
        };
      },
      toggleDetails: () => {
        return ({ state, chain }) => {
          const node = findParentNode(node => node.type === this.type)(state.selection);
          if (node) {
            return chain().unsetDetails().run();
          } else {
            return chain().setDetails().run();
          }
        };
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-d": () => this.editor.commands.toggleDetails(),
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
