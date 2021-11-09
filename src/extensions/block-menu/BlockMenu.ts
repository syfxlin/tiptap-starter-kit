import { Editor, Extension, findParentNode } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "prosemirror-state";
import BlockMenuView from "./BlockMenuView";
import { Decoration, DecorationSet } from "prosemirror-view";
import { items } from "./default-items";

export type BlockMenuItem =
  | {
      separator: true;
    }
  | {
      separator?: false;
      name: string;
      keywords: string;
      view: (dom: HTMLElement) => void;
      command: (editor: Editor) => void;
      disable?: (editor: Editor) => boolean;
    };

export type BlockMenuOptions = {
  pluginKey: string;
  items: BlockMenuItem[];
  dictionary: {
    newLineEmpty: string;
    newLineWithSlash: string;
    queryEmpty: string;
  };
};

export const BlockMenu = Extension.create<BlockMenuOptions>({
  name: "blockMenu",
  addOptions() {
    return {
      pluginKey: "blockMenu",
      items,
      dictionary: {
        newLineEmpty: "输入 '/' 以插入块...",
        newLineWithSlash: "继续输入进行过滤...",
        queryEmpty: "没有找到结果",
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey(this.options.pluginKey),
        char: "/",
        items: ({ query }) => {
          let items = this.options.items.filter(
            (item) => item.separator || !item.disable?.(this.editor)
          );
          if (query !== "") {
            items = items.filter((item) => {
              if (item.separator) {
                return true;
              }
              const n = query.toLowerCase();
              return (
                item.name.toLowerCase().includes(n) ||
                item.keywords.toLowerCase().includes(n)
              );
            });
          }
          return items.reduce((acc, item, index) => {
            if ((index === 0 || index === items.length - 1) && item.separator) {
              return acc;
            }
            const prev = items[index - 1];
            const next = items[index + 1];
            if (item.separator) {
              if (prev && prev.separator) {
                return acc;
              }
              if (next && next.separator) {
                return acc;
              }
            }
            return [...acc, item];
          }, [] as BlockMenuItem[]);
        },
        command: ({ editor, props }) => {
          // clear search
          const { state, dispatch } = editor.view;
          const $from = state.selection.$from;
          const tr = state.tr.deleteRange($from.start(), $from.pos);
          dispatch(tr);
          // command
          const item = props as any;
          item.command(editor);
          // focus
          editor.view.focus();
        },
        render: () => {
          let view: BlockMenuView;
          return {
            onStart: (props) => {
              view = new BlockMenuView({
                editor: this.editor,
                dictionary: this.options.dictionary,
              });
              view.update(props);
            },
            onUpdate: (props) => {
              view.update(props);
            },
            onKeyDown: (props) => {
              return view.onKeyDown(props);
            },
            onExit: () => {
              view.destroy();
            },
          };
        },
      }),
      new Plugin({
        key: new PluginKey(`${this.options.pluginKey}-placeholder`),
        props: {
          decorations: (state) => {
            const parent = findParentNode(
              (node) => node.type.name === "paragraph"
            )(state.selection);
            if (!parent) {
              return;
            }
            const decorations: Decoration[] = [];
            const isEmpty = parent && parent.node.content.size === 0;
            const isSlash = parent && parent.node.textContent === "/";
            const isTopLevel = state.selection.$from.depth === 1;

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": this.options.dictionary.newLineEmpty,
                    }
                  )
                );
              }

              if (isSlash) {
                decorations.push(
                  Decoration.node(
                    parent.pos,
                    parent.pos + parent.node.nodeSize,
                    {
                      class: "placeholder",
                      "data-empty-text": `  ${this.options.dictionary.newLineWithSlash}`,
                    }
                  )
                );
              }

              return DecorationSet.create(state.doc, decorations);
            }
            return null;
          },
        },
      }),
    ];
  },
});
