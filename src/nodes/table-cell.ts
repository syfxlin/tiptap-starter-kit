import { TableCell as TTableCell } from "@tiptap/extension-table-cell";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { ClickMenuItemStorage } from "../extensions/click-menu/view";

export const TableCell = TTableCell.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      clickMenu: false,
      parser: {
        match: node => node.type === "tableCell" && !node.isHeader,
        apply: (state, node, type) => {
          const align = node.align as string;
          state.openNode(type, { alignment: align });
          state.openNode(state.editor.schema.nodes.paragraph);
          state.next(node.children);
          state.closeNode();
          state.closeNode();
        },
      },
      serializer: {
        match: node => node.type.name === this.name,
        apply: (state, node) => {
          state.openNode({ type: "tableCell" });
          state.next(node.content);
          state.closeNode();
        },
      },
    } satisfies NodeMarkdownStorage & ClickMenuItemStorage;
  },
});
