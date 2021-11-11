import { ListItem as TListItem } from "@tiptap/extension-list-item";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const ListItem = TListItem.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "listItem" && node.checked === null,
        runner: (state, node, type) => {
          state.openNode(type);
          state.next(node.children);
          state.closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "listItem",
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
