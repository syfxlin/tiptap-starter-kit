import { Table as TTable, TableOptions as TTableOptions } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { posToDOMRect } from "@tiptap/core";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";
import { FloatMenuView } from "../extensions/float-menu/view";
import { findTable, getCellInTable, isTableSelected } from "../utils/editor";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";

export interface TableOptions extends TTableOptions {
  dictionary: {
    name: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    toggleHeaderRow: string;
    toggleHeaderCol: string;
    deleteTable: string;
  };
}

// TODO: drag row or column
// TODO: serialize custom properties to markdown
export const Table = TTable.extend<TableOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
      dictionary: {
        name: "Table",
        alignLeft: "Left alignment",
        alignCenter: "Center alignment",
        alignRight: "Right alignment",
        toggleHeaderRow: "Toggle header row",
        toggleHeaderCol: "Toggle header column",
        deleteTable: "Delete table",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "table",
          apply: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
              state.next(node.children.map((a, i) => ({ ...a, align: node.align[i], isHeader: i === 0 })));
            }
            state.closeNode();
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
      },
      floatMenu: {
        hide: true,
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("table"),
            keywords: "table,bg",
            action: editor => editor.chain().insertTable({ rows: 3, cols: 3 }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & FloatMenuItemStorage & BlockMenuItemStorage;
  },
  addProseMirrorPlugins() {
    return [
      ...TTable.config.addProseMirrorPlugins?.apply(this) ?? [],
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: FloatMenuView.create({
          editor: this.editor,
          show: ({ editor }) => {
            if (!editor.isEditable) {
              return false;
            }
            return isTableSelected(editor.state.selection);
          },
          rect: ({ editor }) => {
            const { view, state } = editor;
            const table = findTable(state.selection);
            if (table) {
              const node = view.nodeDOM(table.pos) as HTMLElement;
              const grip = node?.querySelector(".ProseMirror-table-grip-table");
              if (grip) {
                return grip.getBoundingClientRect();
              }
            }
            return posToDOMRect(view, state.selection.from, state.selection.to);
          },
          onInit: ({ view, editor, element }) => {
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
            const toggleHeaderRow = view.createButton({
              name: this.options.dictionary.toggleHeaderRow,
              view: icon("header-row"),
              onClick: () => editor.chain().toggleHeaderRow().run(),
            });
            const toggleHeaderCol = view.createButton({
              name: this.options.dictionary.toggleHeaderCol,
              view: icon("header-col"),
              onClick: () => editor.chain().toggleHeaderColumn().run(),
            });
            const deleteTable = view.createButton({
              name: this.options.dictionary.deleteTable,
              view: icon("remove"),
              onClick: () => editor.chain().deleteTable().run(),
            });

            element.append(alignLeft.button);
            element.append(alignCenter.button);
            element.append(alignRight.button);
            element.append(toggleHeaderRow.button);
            element.append(toggleHeaderCol.button);
            element.append(deleteTable.button);
          },
        }),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Array<Decoration> = [];
            if (this.editor.isEditable) {
              const cell = getCellInTable(selection, 0, 0);
              if (cell) {
                decorations.push(
                  Decoration.widget(cell.pos + 1, () => {
                    const grip = document.createElement("div");
                    grip.classList.add("ProseMirror-table-grip-table");
                    return grip;
                  }),
                );
              }
            }
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
