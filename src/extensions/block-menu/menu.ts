import { Editor, Extension } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { BlockMenuView, BlockMenuViewItem } from "./view";

export interface BlockMenuItem {
  name: string;
  icon: string;
  keywords: string;
  shortcut?: string;
  action: (editor: Editor, view: BlockMenuView) => void;
}

export interface BlockMenuItemStorage {
  blockMenu: BlockMenuItem;
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
      items: ["bold", "bold", "|", "bold"],
      dictionary: {
        lineEmpty: "Enter '/' to insert block...",
        lineSlash: "Continue typing to filter...",
        queryEmpty: "No results found",
      },
    };
  },
  addProseMirrorPlugins() {
    return [
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
            const item = this.editor.storage[name]?.blockMenu as BlockMenuItem | undefined;
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
              action: (editor, view) => {
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
              render: (_editor, view, element) => view.createButton(element, {
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
        render: () => {
          return new BlockMenuView({
            editor: this.editor,
            dictionary: {
              empty: this.options.dictionary.queryEmpty,
            },
          });
        },
      }),
    ];
  },
});
