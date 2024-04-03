import { TaskList as TTaskList, TaskListOptions as TTaskListOptions } from "@tiptap/extension-task-list";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface TaskListOptions extends TTaskListOptions {
  dictionary: {
    name: string;
  };
}

export const TaskList = TTaskList.extend<TaskListOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Task List",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "list" && !node.ordered && node.children?.find(item => item.checked !== null),
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
              ordered: false,
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
            icon: icon("tl"),
            shortcut: "Mod-Shift-9",
            keywords: "tasklist,tl,rwlb",
            action: editor => editor.chain().toggleTaskList().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
