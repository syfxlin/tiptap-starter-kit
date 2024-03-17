import {
  HorizontalRule as THorizontalRule,
  HorizontalRuleOptions as THorizontalRuleOptions,
} from "@tiptap/extension-horizontal-rule";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { horizontalrule } from "../utils/icons";

export interface HorizontalRuleOptions extends THorizontalRuleOptions {
  dictionary: {
    name: string;
  };
}

export const HorizontalRule = THorizontalRule.extend<HorizontalRuleOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "HorizontalRule",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "thematicBreak",
        apply: (state, _node, type) => {
          state.addNode(type);
        },
      },
      serializer: {
        match: node => node.type.name === this.name,
        apply: (state) => {
          state.addNode({
            type: "thematicBreak",
          });
        },
      },
      blockMenu: {
        id: this.name,
        name: this.options.dictionary.name,
        icon: horizontalrule,
        keywords: "horizontalrule,hr,hx,fgx",
        action: editor => editor.chain().setHorizontalRule().focus().run(),
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});