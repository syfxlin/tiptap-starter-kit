import {
  isNodeActive,
  mergeAttributes,
  Node,
  nodeInputRule,
} from "@tiptap/core";
import { Node as ProseNode } from "prosemirror-model";
import { attrs } from "./utils";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Delete, Share } from "@icon-park/svg";
import { css } from "@emotion/css";
import { Plugin, PluginKey } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import {
  buttonView,
  groupView,
  inputView,
} from "../extensions/float-menu/utils";
import { defaultEmbedItems } from "./default-embeds";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type EmbedItem = {
  name: string;
  icon: (() => HTMLElement) | HTMLElement | string;
  matcher: (src: string) => string | undefined | null | false;
  view?: (
    iframe: HTMLIFrameElement,
    toolbar: HTMLDivElement,
    node: ProseNode
  ) => void;
};

export type EmbedOptions = {
  items: EmbedItem[];
  HTMLAttributes: Record<string, any>;
  dictionary: {
    openEmbed: string;
    inputSrc: string;
    inputTitle: string;
    deleteEmbed: string;
  };
};

export const Embed = Node.create<EmbedOptions>({
  name: "embed",
  content: "inline*",
  group: "block",
  atom: true,
  addOptions() {
    return {
      items: defaultEmbedItems,
      dictionary: {
        openEmbed: "打开",
        inputSrc: "输入或粘贴链接",
        inputTitle: "标题",
        deleteEmbed: "删除嵌入",
      },
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "iframe[src]",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.classList.add(css`
        resize: vertical;
        overflow-x: hidden;
        overflow-y: auto;
        border-radius: 4px;
        border: 1px solid var(--tiptap-color-border);
        background-color: var(--tiptap-color-background-secondly);
        display: flex;
        flex-direction: column;

        iframe {
          flex: 1;
        }

        img {
          border: 0 !important;
          padding: 0 !important;
          background-color: transparent !important;
          width: 1em;
          height: 1em;
        }
      `);

      const iframe = document.createElement("iframe");
      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        iframe.setAttribute(key, value);
      });
      iframe.title = node.attrs.title;

      dom.append(iframe);

      const item = this.options.items.find((item) =>
        item.matcher(node.attrs.src)
      );

      if (item) {
        iframe.src = item.matcher(node.attrs.src) as string;

        const toolbar = document.createElement("div");
        toolbar.classList.add(css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1em;

          > div {
            display: flex;
            align-items: center;
            font-size: 0.85em;

            > div:first-of-type {
              display: flex;
              align-items: center;
              margin-right: 0.3em;
            }
          }
        `);

        const left = document.createElement("div");
        const icon = document.createElement("div");
        if (typeof item.icon === "string") {
          icon.innerHTML = item.icon;
        } else {
          icon.append(
            typeof item.icon === "function" ? item.icon() : item.icon
          );
        }
        const name = document.createElement("div");
        name.textContent = item.name;
        left.append(icon);
        left.append(name);

        const right = document.createElement("div");
        const share = document.createElement("div");
        share.innerHTML = Share({});
        const open = document.createElement("a");
        open.target = "_blank";
        open.rel = "noopener noreferrer";
        open.href = node.attrs.src;
        open.textContent = this.options.dictionary.openEmbed;
        right.append(share);
        right.append(open);

        // custom
        item.view?.(iframe, toolbar, node);

        toolbar.append(left);
        toolbar.append(right);
        dom.append(toolbar);
      } else {
        iframe.src = node.attrs.src;
        dom.classList.add(css`
          padding-bottom: 1em;
        `);
      }

      return {
        dom,
      };
    };
  },
  addStorage() {
    return {
      parser: {
        match: (node) =>
          node.type === "textDirective" && node.name === this.name,
        runner: (state, node, type) => {
          state.addNode(type, node.attributes);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "textDirective",
            name: this.name,
            attributes: node.attrs,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /(:embed{([^}]+)})/,
        type: this.type,
        getAttributes: (match) => attrs(match[2]),
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}FloatMenu`),
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            shouldShow: ({ editor }) =>
              editor.isEditable && isNodeActive(editor.state, this.name),
            init: (dom, editor) => {
              const group = groupView("column");

              const src = inputView({
                id: "src",
                placeholder: this.options.dictionary.inputSrc,
              });

              const title = inputView({
                id: "title",
                placeholder: this.options.dictionary.inputTitle,
              });

              const remove = buttonView({
                name: this.options.dictionary.deleteEmbed,
                icon: Delete({}),
              });
              remove.button.addEventListener("click", () => {
                editor.chain().deleteSelection().run();
              });

              dom.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  editor
                    .chain()
                    .updateAttributes(this.name, {
                      src: src.input.value,
                      title: title.input.value,
                    })
                    .focus()
                    .run();
                }
              });
              group.append(src.input);
              group.append(title.input);
              dom.append(group);
              dom.append(remove.button);
            },
            update: (dom, { editor }) => {
              const attrs = editor.getAttributes(this.name);

              const src = dom.querySelector("input.id-src") as HTMLInputElement;
              src.value = attrs.src || "";

              const title = dom.querySelector(
                "input.id-title"
              ) as HTMLInputElement;
              title.value = attrs.title || "";
            },
          }),
      }),
    ];
  },
});
