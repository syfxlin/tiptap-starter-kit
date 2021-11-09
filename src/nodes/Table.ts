import { Table as TTable } from "@tiptap/extension-table";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { MarkdownNode } from "../extensions/markdown/types";

export const Table = TTable.extend({
  addStorage() {
    return {
      // @ts-ignore
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "table",
        runner: (state, node, type) => {
          const align = node.align as (string | null)[];
          const children = (node.children as MarkdownNode[]).map((x, i) => ({
            ...x,
            align,
            isHeader: i === 0,
          }));
          state.openNode(type).next(children).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          const firstLine = node.content.firstChild?.content;
          if (!firstLine) return;

          const align: (string | null)[] = [];
          firstLine.forEach((cell) => {
            align.push(cell.attrs.alignment);
          });
          state
            .openNode({
              type: "table",
              align,
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
});
