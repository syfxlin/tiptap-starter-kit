import { BulletList as TBulletList, BulletListOptions as TBulletListOptions } from "@tiptap/extension-bullet-list";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { bulletlist } from "../utils/icons";

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
        name: "BulletList",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
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
      blockMenu: {
        name: this.options.dictionary.name,
        icon: bulletlist,
        shortcut: "Mod-Shift-8",
        keywords: "bulletlist,bl,wxlb",
        action: editor => editor.chain().toggleBulletList().focus().run(),
      },
    } as NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
