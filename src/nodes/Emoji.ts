import { InputRule, Node } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Processor } from "unified";
import remarkGemoji from "remark-gemoji";
import { nameToEmoji } from "gemoji";
import { Suggestion } from "@tiptap/suggestion";
import { PluginKey } from "prosemirror-state";
import BlockMenuView from "../extensions/block-menu/BlockMenuView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    emoji: {
      setEmoji: (name: string) => ReturnType;
    };
  }
}

export type EmojiOptions = {
  dictionary: {
    queryEmpty: string;
  };
};

export const Emoji = Node.create<EmojiOptions>({
  name: "emoji",
  inline: true,
  group: "inline",
  marks: "",
  content: "text*",
  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }];
  },
  renderHTML({ node }) {
    return ["span", { "data-type": this.name }, nameToEmoji[node.textContent]];
  },
  addOptions() {
    return {
      dictionary: {
        queryEmpty: "没有找到结果",
      },
    };
  },
  addStorage() {
    return {
      remark: (processor: Processor) => processor.use(remarkGemoji),
      parser: {
        match: (node) => node.type === "emoji",
        runner: (state, node, type) => {
          state.openNode(type).addText(node.value).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "text",
            value: node.content.firstChild?.text || "",
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey(`${this.name}-suggestion`),
        char: "::",
        items: ({ query }) => {
          const items = Object.keys(nameToEmoji).map((name) => ({
            name,
            view: (dom: HTMLElement) => {
              dom.textContent = `${name} - ${nameToEmoji[name]}`;
            },
          }));
          if (query === "") {
            return items.slice(0, 20);
          }
          const n = query.toLowerCase();
          return items
            .filter((item) => item.name.toLowerCase().includes(n))
            .slice(0, 20);
        },
        command: ({ editor, props, range }) => {
          // command
          const item = props as any;
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                content: [
                  {
                    type: "text",
                    text: item.name,
                  },
                ],
              },
            ])
            .run();
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
    ];
  },
  addCommands() {
    return {
      setEmoji:
        (name) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: name,
              },
            ],
          }),
    };
  },
  addInputRules() {
    return [
      new InputRule({
        find: /:([a-zA-Z0-9_+]+):$/,
        handler: ({ state, range, match }) => {
          const { tr, schema } = state;
          const { from, to } = range;
          if (match && match.length > 0) {
            tr.replaceWith(
              from,
              to,
              this.type.create(undefined, schema.text(match[1]))
            );
          }
          return tr;
        },
      }),
    ];
  },
});
