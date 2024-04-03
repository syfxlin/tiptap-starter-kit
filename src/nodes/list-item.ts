import { ListItem as TListItem } from "@tiptap/extension-list-item";
import { NodeMarkdownStorage } from "../extensions/markdown";

export const ListItem = TListItem.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "listItem" && node.checked === null,
          apply: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({ type: "listItem" });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
