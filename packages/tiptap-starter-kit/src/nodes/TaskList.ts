import { TaskList as TTaskList } from "@tiptap/extension-task-list";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const TaskList = TTaskList.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) =>
          node.type === "list" &&
          !node.ordered &&
          node.children?.find((item) => item.checked !== null),
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
