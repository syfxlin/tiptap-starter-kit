import { OrderedList as TOrderedList, OrderedListOptions as TOrderedListOptions } from "@tiptap/extension-ordered-list";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface OrderedListOptions extends TOrderedListOptions {
  dictionary: {
    name: string;
  };
}

export const OrderedList = TOrderedList.extend<OrderedListOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Ordered List",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "list" && !!node.ordered,
          apply: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({
              type: "list",
              ordered: true,
              start: 1,
            });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("ol"),
            shortcut: "Mod-Shift-7",
            keywords: "orderedlist,ol,yxlb",
            action: editor => editor.chain().toggleOrderedList().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
