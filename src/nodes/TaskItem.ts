import { TaskItem as TTaskItem } from "@tiptap/extension-task-item";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

export const TaskItem = TTaskItem.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      nested: true,
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "listItem" && node.checked !== null,
        runner: (state, node, type) => {
          state
            .openNode(type, { checked: node.checked as boolean })
            .next(node.children)
            .closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "listItem",
              checked: node.attrs.checked,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
