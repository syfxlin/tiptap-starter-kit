import { TableRow as TTableRow } from "@tiptap/extension-table-row";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { MarkdownNode } from "../extensions/markdown/types";

export const TableRow = TTableRow.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "tableRow",
        runner: (state, node, type) => {
          const align = node.align as (string | null)[];
          const children = (node.children as MarkdownNode[]).map((x, i) => ({
            ...x,
            align: align[i],
            isHeader: node.isHeader,
          }));
          state.openNode(type).next(children).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "tableRow",
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
