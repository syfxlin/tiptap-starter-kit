import { TableHeader as TTableHeader, TableHeaderOptions as TTableHeaderOptions } from "@tiptap/extension-table-header";
import { posToDOMRect } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { icon } from "../utils/icons";
import { getCellsInRow, isCellSelection, isColumnSelected, isTableSelected, selectColumn } from "../utils/editor";

import { ClickMenuItemStorage } from "../extensions/click-menu/menu";

export interface TableHeaderOptions extends TTableHeaderOptions {
  dictionary: {
    insertLeft: string;
    insertRight: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    deleteCol: string;
  };
}

export const TableHeader = TTableHeader.extend<TableHeaderOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        insertLeft: "Insert column on the left",
        insertRight: "Insert column on the right",
        alignLeft: "Left alignment",
        alignCenter: "Center alignment",
        alignRight: "Right alignment",
        deleteCol: "Delete column",
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
          match: node => node.type === "tableCell" && !!node.isHeader,
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
      ...TTableHeader.config.addProseMirrorPlugins?.apply(this) ?? [],
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
            const cells = getCellsInRow(selection, 0);
            return !!cells?.some((_cell, index) => isColumnSelected(selection, index));
          },
          rect: ({ editor }) => {
            const { view, state } = editor;
            if (isCellSelection(state.selection)) {
              const cell = view.nodeDOM(state.selection.$headCell.pos) as HTMLElement;
              if (cell) {
                const grip = cell.querySelector(".ProseMirror-table-grip-col");
                if (grip) {
                  return grip.getBoundingClientRect();
                } else {
                  return cell.getBoundingClientRect();
                }
              }
            }
            return posToDOMRect(view, state.selection.from, state.selection.to);
          },
          onInit: ({ view, editor, element }) => {
            const insertLeft = view.createButton({
              name: this.options.dictionary.insertLeft,
              view: icon("left"),
              onClick: () => editor.chain().addColumnBefore().run(),
            });
            const insertRight = view.createButton({
              name: this.options.dictionary.insertRight,
              view: icon("right"),
              onClick: () => editor.chain().addColumnAfter().run(),
            });
            const alignLeft = view.createButton({
              name: this.options.dictionary.alignLeft,
              view: icon("align-left"),
              onClick: () => editor.chain().setCellAttribute("align", "left").run(),
            });
            const alignCenter = view.createButton({
              name: this.options.dictionary.alignCenter,
              view: icon("align-center"),
              onClick: () => editor.chain().setCellAttribute("align", "center").run(),
            });
            const alignRight = view.createButton({
              name: this.options.dictionary.alignRight,
              view: icon("align-right"),
              onClick: () => editor.chain().setCellAttribute("align", "right").run(),
            });
            const deleteCol = view.createButton({
              name: this.options.dictionary.deleteCol,
              view: icon("remove"),
              onClick: () => editor.chain().deleteColumn().run(),
            });

            element.append(insertLeft.button);
            element.append(insertRight.button);
            element.append(alignLeft.button);
            element.append(alignCenter.button);
            element.append(alignRight.button);
            element.append(deleteCol.button);
          },
        }),
        props: {
          decorations: (state) => {
            const { tr, doc, selection } = state;
            const decorations: Array<Decoration> = [];
            if (this.editor.isEditable) {
              const cells = getCellsInRow(selection, 0);
              if (cells) {
                for (let index = 0; index < cells.length; index++) {
                  decorations.push(
                    Decoration.widget(cells[index].pos + 1, () => {
                      const grip = document.createElement("div");
                      grip.classList.add("ProseMirror-table-grip-col");
                      if (isColumnSelected(selection, index)) {
                        grip.classList.add("active");
                      }
                      if (index === 0) {
                        grip.classList.add("first");
                      } else if (index === cells.length - 1) {
                        grip.classList.add("last");
                      }
                      const drag = document.createElement("div");
                      drag.classList.add("ProseMirror-table-grip-drag");
                      drag.innerHTML = icon("drag");
                      drag.addEventListener("mousedown", (event) => {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        this.editor.view.dispatch(selectColumn(tr, index));
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
