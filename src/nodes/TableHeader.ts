import {
  TableHeader as TTableHeader,
  TableHeaderOptions as TTableHeaderOptions,
} from "@tiptap/extension-table-header";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  getCellsInRow,
  isColumnSelected,
  isTableSelected,
  selectColumn,
} from "./utils";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { buttonView } from "../extensions/float-menu/utils";
import { Delete, DoubleLeft, DoubleRight } from "@icon-park/svg";

export type TableHeaderOptions = TTableHeaderOptions & {
  dictionary: {
    insertLeft: string;
    insertRight: string;
    delete: string;
  };
};

export const TableHeader = TTableHeader.extend<TableHeaderOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        insertLeft: "在左边插入列",
        insertRight: "在右边插入列",
        delete: "删除",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "tableCell" && !!node.isHeader,
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
        key: new PluginKey(`${this.name}FloatMenu`),
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            // has one selected should show
            shouldShow: ({ editor }) => {
              if (!editor.isEditable) {
                return false;
              }
              const selection = editor.state.selection;
              if (isTableSelected(selection)) {
                return false;
              }
              const cells = getCellsInRow(0)(selection);
              return !!cells?.some((cell, index) =>
                isColumnSelected(index)(selection)
              );
            },
            init: (dom, editor) => {
              const insertLeft = buttonView({
                name: this.options.dictionary.insertLeft,
                icon: DoubleLeft({}),
              });
              insertLeft.button.addEventListener("click", () => {
                editor.chain().addColumnBefore().run();
              });
              const insertRight = buttonView({
                name: this.options.dictionary.insertRight,
                icon: DoubleRight({}),
              });
              insertRight.button.addEventListener("click", () => {
                editor.chain().addColumnAfter().run();
              });
              const remove = buttonView({
                name: this.options.dictionary.delete,
                icon: Delete({}),
              });
              remove.button.addEventListener("click", () => {
                editor.chain().deleteColumn().run();
              });

              dom.append(insertLeft.button);
              dom.append(insertRight.button);
              dom.append(remove.button);
            },
          }),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInRow(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection);
                    const grip = document.createElement("a");
                    grip.classList.add("grip-column");
                    if (colSelected) {
                      grip.classList.add("selected");
                    }
                    if (index === 0) {
                      grip.classList.add("first");
                    } else if (index === cells.length - 1) {
                      grip.classList.add("last");
                    }
                    grip.addEventListener("mousedown", (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                      this.editor.view.dispatch(
                        selectColumn(index)(this.editor.state.tr)
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
