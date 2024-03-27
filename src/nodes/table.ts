import { Table as TTable, TableOptions as TTableOptions } from "@tiptap/extension-table";
import { MarkdownNode, NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface TableOptions extends TTableOptions {
  dictionary: {
    name: string;
  };
}

export const Table = TTable.extend<TableOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Table",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "table",
        apply: (state, node, type) => {
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
        match: node => node.type.name === this.name,
        apply: (state, node) => {
          const firstLine = node.content.firstChild?.content;
          if (!firstLine) {
            return;
          }
          const align: (string | null)[] = [];
          firstLine.forEach(cell => align.push(cell.attrs.alignment));
          state.openNode({ type: "table", align });
          state.next(node.content);
          state.closeNode();
        },
      },
      blockMenu: {
        id: this.name,
        name: this.options.dictionary.name,
        icon: icon("table"),
        keywords: "table,bg",
        action: editor => editor.chain().insertTable({ rows: 3, cols: 3 }).focus().run(),
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
