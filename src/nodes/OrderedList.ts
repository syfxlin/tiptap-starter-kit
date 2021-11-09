import { OrderedList as TOrderedList } from "@tiptap/extension-ordered-list";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const OrderedList = TOrderedList.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "list" && !!node.ordered,
        runner: (state, node, type) => {
          state.openNode(type).next(node.children).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "list",
              ordered: true,
              start: 1,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
