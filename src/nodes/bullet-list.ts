import { BulletList as TBulletList, BulletListOptions as TBulletListOptions } from "@tiptap/extension-bullet-list";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

export interface BulletListOptions extends TBulletListOptions {
  dictionary: {
    name: string;
  };
}

export const BulletList = TBulletList.extend<BulletListOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Bullet List",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "list" && !node.ordered && !node.children?.find(item => item.checked !== null),
          apply: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.openNode({
              type: "list",
              ordered: false,
            });
            state.next(node.content);
            state.closeNode();
          },
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("ul"),
            shortcut: "Mod-Shift-8",
            keywords: "bulletlist,bl,ul,wxlb",
            action: editor => editor.chain().toggleBulletList().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
