import { posToDOMRect } from "@tiptap/core";
import { TableRow as TTableRow, TableRowOptions as TTableRowOptions } from "@tiptap/extension-table-row";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ClickMenuItemStorage } from "../extensions/click-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { getCellsInColumn, isCellSelection, isRowSelected, isTableSelected, selectRow } from "../utils/editor";

import { icon } from "../utils/icons";

export interface TableRowOptions extends TTableRowOptions {
  dictionary: {
    insertTop: string;
    insertBottom: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    deleteRow: string;
  };
}

export const TableRow = TTableRow.extend<TableRowOptions>({
  name: "tableRow",
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        insertTop: "Insert column on the top",
        insertBottom: "Insert column on the bottom",
        alignLeft: "Left alignment",
        alignCenter: "Center alignment",
        alignRight: "Right alignment",
        deleteRow: "Delete row",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "tableRow",
          apply: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
              state.next(node.children.map((a, i) => ({ ...a, align: node.align?.[i], isHeader: node.isHeader })));
            }
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({ type: "tableRow" });
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
      ...TTableRow.config.addProseMirrorPlugins?.apply(this) ?? [],
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
            const cells = getCellsInColumn(selection, 0);
            return !!cells?.some((_cell, index) => isRowSelected(selection, index));
          },
          rect: ({ editor }) => {
            const { view, state } = editor;
            if (isCellSelection(state.selection)) {
              const cell = view.nodeDOM(state.selection.$headCell.pos) as HTMLElement;
              if (cell) {
                const grip = cell.querySelector(".ProseMirror-table-grip-row");
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
            const insertTop = view.createButton({
              id: "insert-top",
              name: this.options.dictionary.insertTop,
              icon: icon("up"),
              onClick: () => editor.chain().addRowBefore().run(),
            });
            const insertBottom = view.createButton({
              id: "insert-bottom",
              name: this.options.dictionary.insertBottom,
              icon: icon("down"),
              onClick: () => editor.chain().addRowAfter().run(),
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
            const deleteRow = view.createButton({
              id: "remove",
              name: this.options.dictionary.deleteRow,
              icon: icon("remove"),
              onClick: () => editor.chain().deleteRow().run(),
            });

            root.append(insertTop);
            root.append(insertBottom);
            root.append(alignLeft);
            root.append(alignCenter);
            root.append(alignRight);
            root.append(deleteRow);
          },
        }),
        props: {
          decorations: (state) => {
            const { tr, doc, selection } = state;
            const decorations: Array<Decoration> = [];
            if (this.editor.isEditable) {
              const cells = getCellsInColumn(selection, 0);
              if (cells) {
                for (let index = 0; index < cells.length; index++) {
                  decorations.push(
                    Decoration.widget(cells[index].pos + 1, () => {
                      const grip = document.createElement("div");
                      grip.classList.add("ProseMirror-table-grip-row");
                      if (isRowSelected(selection, index)) {
                        grip.classList.add("active");
                      }
                      if (index === 0) {
                        grip.classList.add("first");
                      }
                      if (index === cells.length - 1) {
                        grip.classList.add("last");
                      }
                      const drag = document.createElement("div");
                      drag.classList.add("ProseMirror-table-grip-drag");
                      drag.innerHTML = icon("drag");
                      drag.addEventListener("mousedown", (event) => {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        this.editor.view.dispatch(selectRow(tr, index));
                      });
                      grip.append(drag);
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
