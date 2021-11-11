import { BulletList as TBulletList } from "@tiptap/extension-bullet-list";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const BulletList = TBulletList.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) =>
          node.type === "list" &&
          !node.ordered &&
          !node.children?.find((item) => item.checked !== null),
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
              ordered: false,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
