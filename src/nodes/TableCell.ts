import { TableCell as TTableCell } from "@tiptap/extension-table-cell";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  getCellsInColumn,
  isRowSelected,
  isTableSelected,
  selectRow,
  selectTable,
} from "./utils";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { buttonView } from "../extensions/float-menu/utils";
import { Delete, DoubleDown, DoubleUp } from "@icon-park/svg";

export const TableCell = TTableCell.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "tableCell" && !node.isHeader,
        runner: (state, node, type) => {
          const align = node.align as string;
          state
            .openNode(type, { alignment: align })
            .openNode(state.editor.schema.nodes.paragraph)
            .next(node.children)
            .closeNode()
            .closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state
            .openNode({
              type: "tableCell",
            })
            .next(node.content)
            .closeNode();
        },
      },
    } as NodeMarkdownStorage;
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            // has one selected should show
            shouldShow: ({ editor }) => {
              if (!editor.isEditable) {
                return false;
              }
              const cells = getCellsInColumn(0)(editor.state.selection);
              return !!cells?.some((cell, index) =>
                isRowSelected(index)(editor.state.selection)
              );
            },
            init: (dom, editor) => {
              const insertTop = buttonView({
                id: "insert-top",
                name: "在上边插入列",
                icon: DoubleUp({}),
              });
              insertTop.button.addEventListener("click", () => {
                editor.chain().addRowBefore().run();
              });
              const insertBottom = buttonView({
                id: "insert-bottom",
                name: "在下边插入列",
                icon: DoubleDown({}),
              });
              insertBottom.button.addEventListener("click", () => {
                editor.chain().addRowAfter().run();
              });
              const remove = buttonView({
                name: "删除",
                icon: Delete({}),
              });
              remove.button.addEventListener("click", () => {
                if (isTableSelected(editor.state.selection)) {
                  editor.chain().deleteTable().run();
                } else {
                  editor.chain().deleteRow().run();
                }
              });

              dom.append(insertTop.button);
              dom.append(insertBottom.button);
              dom.append(remove.button);
            },
          }),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInColumn(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                if (index === 0) {
                  decorations.push(
                    Decoration.widget(pos + 1, () => {
                      const grip = document.createElement("a");
                      grip.classList.add("grip-table");
                      if (isTableSelected(selection)) {
                        grip.classList.add("selected");
                      }
                      grip.addEventListener("mousedown", (event) => {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        this.editor.view.dispatch(
                          selectTable(this.editor.state.tr)
                        );
                      });
                      return grip;
                    })
                  );
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);
                    const grip = document.createElement("a");
                    grip.classList.add("grip-row");
                    if (rowSelected) {
                      grip.classList.add("selected");
                    }
                    if (index === 0) {
                      grip.classList.add("first");
                    }
                    if (index === cells.length - 1) {
                      grip.classList.add("last");
                    }
                    grip.addEventListener("mousedown", (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                      this.editor.view.dispatch(
                        selectRow(index)(this.editor.state.tr)
                      );
                    });
                    return grip;
                  })
                );
              });
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
