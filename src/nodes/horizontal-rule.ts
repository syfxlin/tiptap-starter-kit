import {
  HorizontalRule as THorizontalRule,
  HorizontalRuleOptions as THorizontalRuleOptions,
} from "@tiptap/extension-horizontal-rule";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";

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
        name: "Horizontal Rule",
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
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
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("hr"),
            keywords: "horizontalrule,hr,hx,fgx",
            action: editor => editor.chain().setHorizontalRule().focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
});
