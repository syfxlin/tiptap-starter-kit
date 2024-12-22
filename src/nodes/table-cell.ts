import { posToDOMRect } from "@tiptap/core";
import { TableCell as TTableCell, TableCellOptions as TTableCellOptions } from "@tiptap/extension-table-cell";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ClickMenuItemStorage } from "../extensions/click-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import {
  findTable,
  getCellsInColumn,
  getCellsInRow,
  isCellSelection,
  isColumnSelected,
  isRowSelected,
  isTableSelected,
} from "../utils/editor";
import { icon } from "../utils/icons";

export interface TableCellOptions extends TTableCellOptions {
  dictionary: {
    mergeCells: string;
    splitCells: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
  };
}

export const TableCell = TTableCell.extend<TableCellOptions>({
  name: "tableCell",
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        mergeCells: "Merge cells",
        splitCells: "Split cells",
        alignLeft: "Left alignment",
        alignCenter: "Center alignment",
        alignRight: "Right alignment",
      },
    };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "tableCell" && !node.isHeader,
          apply: (state, node, type) => {
            state.openNode(type, { alignment: node.align });
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
      },
      clickMenu: {
        hide: true,
      },
    } satisfies NodeMarkdownStorage & ClickMenuItemStorage;
  },
  addProseMirrorPlugins() {
    return [
      ...TTableCell.config.addProseMirrorPlugins?.apply(this) ?? [],
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: FloatMenuView.create({
          editor: this.editor,
          show: ({ editor }) => {
            if (!editor.isEditable) {
              return false;
            }
            const selection = editor.state.selection;
            if (isTableSelected(selection)) {
              return false;
            }
            if (getCellsInRow(selection, 0)?.some((_cell, index) => isColumnSelected(selection, index))) {
              return false;
            }
            if (getCellsInColumn(selection, 0)?.some((_cell, index) => isRowSelected(selection, index))) {
              return false;
            }
            return isCellSelection(selection);
          },
          rect: ({ editor }) => {
            const { view, state } = editor;
            if (isCellSelection(state.selection)) {
              const cell = view.nodeDOM(state.selection.$headCell.pos) as HTMLElement;
              if (cell) {
                const grip = cell.querySelector(".ProseMirror-table-grip-cell");
                if (grip) {
                  return grip.getBoundingClientRect();
                } else {
                  return cell.getBoundingClientRect();
                }
              }
            }
            return posToDOMRect(view, state.selection.from, state.selection.to);
          },
          onInit: ({ view, editor, root }) => {
            const mergeCells = view.createButton({
              id: "merge-cells",
              name: this.options.dictionary.mergeCells,
              icon: icon("merge-cells"),
              onClick: () => editor.chain().mergeCells().run(),
            });
            const splitCells = view.createButton({
              id: "split-cells",
              name: this.options.dictionary.splitCells,
              icon: icon("split-cells"),
              onClick: () => editor.chain().splitCell().run(),
            });
            const alignLeft = view.createButton({
              id: "align-left",
              name: this.options.dictionary.alignLeft,
              icon: icon("align-left"),
              onClick: () => editor.chain().setCellAttribute("align", "left").run(),
            });
            const alignCenter = view.createButton({
              id: "align-center",
              name: this.options.dictionary.alignCenter,
              icon: icon("align-center"),
              onClick: () => editor.chain().setCellAttribute("align", "center").run(),
            });
            const alignRight = view.createButton({
              id: "align-right",
              name: this.options.dictionary.alignRight,
              icon: icon("align-right"),
              onClick: () => editor.chain().setCellAttribute("align", "right").run(),
            });

            root.append(mergeCells);
            root.append(splitCells);
            root.append(alignLeft);
            root.append(alignCenter);
            root.append(alignRight);
          },
        }),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Array<Decoration> = [];
            if (this.editor.isEditable) {
              const table = findTable(selection);
              if (table) {
                const map = TableMap.get(table.node);
                for (const pos of map.cellsInRect({ left: 0, right: map.width, top: 0, bottom: map.height })) {
                  decorations.push(
                    Decoration.widget(table.start + pos + 1, () => {
                      const grip = document.createElement("div");
                      grip.classList.add("ProseMirror-table-grip-cell");
                      return grip;
                    }),
                  );
                }
              }
            }
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
