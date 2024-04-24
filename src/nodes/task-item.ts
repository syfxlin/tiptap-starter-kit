import { TaskItem as TTaskItem, TaskItemOptions as TTaskItemOptions } from "@tiptap/extension-task-item";
import { NodeMarkdownStorage } from "../extensions/markdown";

export interface TaskItemOptions extends TTaskItemOptions {}

export const TaskItem = TTaskItem.extend<TaskItemOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      nested: true,
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "listItem" && node.checked !== null,
          apply: (state, node, type) => {
            state.openNode(type, { checked: node.checked as boolean });
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({
              type: "listItem",
              checked: node.attrs.checked,
            });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
    } satisfies NodeMarkdownStorage;
  },
});
