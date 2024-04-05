import { Editor, Extension, findParentNode } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { BlockMenuView, BlockMenuViewItem } from "./view";

export interface BlockMenuItem {
  id: string;
  name: string;
  icon: string;
  keywords: string;
  shortcut?: string;
  action: (editor: Editor, view: BlockMenuView) => void;
}

export interface BlockMenuItemStorage {
  blockMenu: {
    hide?: boolean;
    items: BlockMenuItem | Array<BlockMenuItem>;
  };
}

export interface BlockMenuOptions {
  items: Array<string>;
  dictionary: {
    lineEmpty: string;
    lineSlash: string;
    queryEmpty: string;
  };
}

export const BlockMenu = Extension.create<BlockMenuOptions>({
  name: "blockMenu",
  addOptions() {
    return {
      items: ["orderedList", "taskList", "image", "audio", "video", "table"],
      dictionary: {
        lineEmpty: "Enter '/' to insert block...",
        lineSlash: "Continue typing to filter...",
        queryEmpty: "No results found",
      },
    };
  },
  addProseMirrorPlugins() {
    const mappings = new Map<string, BlockMenuItem>();
    for (const storage of Object.values(this.editor.storage as Record<string, BlockMenuItemStorage>)) {
      if (storage?.blockMenu) {
        if (storage.blockMenu.items) {
          const menus = Array.isArray(storage.blockMenu.items) ? storage.blockMenu.items : [storage.blockMenu.items];
          for (const menu of menus) {
            mappings.set(menu.id, menu);
          }
        }
      }
    }
    if (!mappings.size || !this.options.items.length) {
      return [];
    }
    return [
      ...this.parent?.() ?? [],
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey("block-menu"),
        char: "/",
        items: ({ query }) => {
          const items: Array<BlockMenuViewItem> = [];
          for (const name of this.options.items) {
            if (name === "|") {
              items.push(name);
              continue;
            }
            const item = mappings.get(name);
            if (!item) {
              continue;
            }
            if (query !== "") {
              const q = query.toLowerCase();
              if (!item.name.toLowerCase().includes(q) && !item.keywords.toLowerCase().includes(q)) {
                continue;
              }
            }
            items.push({
              action: ({ editor, view }) => {
                // clear search
                const { state, dispatch } = editor.view;
                const from = state.selection.$from;
                const tr = state.tr.deleteRange(from.start(), from.pos);
                dispatch(tr);
                // command
                item.action(editor, view);
                // focus
                editor.view.focus();
              },
              render: ({ view, element }) => view.createButton(element, {
                id: name,
                name: item.name,
                icon: item.icon,
                shortcut: item.shortcut,
              }),
            });
          }
          return items.reduce<Array<BlockMenuViewItem>>((all, item, index) => {
            if ((index === 0 || index === items.length - 1) && typeof item === "string") {
              return all;
            }
            if (typeof item === "string" && typeof items[index + 1] === "string") {
              return all;
            }
            return [...all, item];
          }, []);
        },
        render: BlockMenuView.create({
          editor: this.editor,
          dictionary: {
            empty: this.options.dictionary.queryEmpty,
          },
        }),
      }),
      new Plugin({
        key: new PluginKey("block-menu-placeholder"),
        props: {
          decorations: (state) => {
            const parent = findParentNode(node => node.type.name === "paragraph")(state.selection);
            if (!parent) {
              return;
            }

            const decorations: Array<Decoration> = [];
            const isEmpty = parent && parent.node.content.size === 0;
            const isSlash = parent && parent.node.textContent === "/";
            const isTopLevel = state.selection.$from.depth === 1;

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                  "class": "ProseMirror-bm-placeholder",
                  "data-empty": this.options.dictionary.lineEmpty,
                }));
              }
              if (isSlash) {
                decorations.push(Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                  "class": "ProseMirror-bm-placeholder",
                  "data-empty": this.options.dictionary.lineSlash,
                }));
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
