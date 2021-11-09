import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { Node as ProseNode } from "prosemirror-model";
import { attrs } from "./utils";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Share } from "@icon-park/svg";
import { css } from "@emotion/css";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type EmbedItem = {
  name: string;
  matcher: (src: string) => boolean;
  href: (src: string) => string;
  icon: (() => HTMLElement) | HTMLElement | string;
  view: (dom: HTMLIFrameElement, node: ProseNode) => void;
};

export type EmbedOptions = {
  items: EmbedItem[];
  HTMLAttributes: Record<string, any>;
  dictionary: {
    open: string;
  };
};

export const Embed = Node.create<EmbedOptions>({
  name: "embed",
  content: "inline*",
  group: "block",
  atom: true,
  addOptions() {
    return {
      // TODO: 增加预设的 embed 项
      items: [],
      dictionary: {
        open: "打开",
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
      `);

      const iframe = document.createElement("iframe");
      iframe.src = node.attrs.src;
      iframe.title = node.attrs.title;
      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        iframe.setAttribute(key, value);
      });

      dom.append(iframe);

      const item = this.options.items.find((item) =>
        item.matcher(node.attrs.src)
      );

      if (item) {
        item.view(iframe, node);

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
        open.href = item.href(node.attrs.src);
        open.textContent = this.options.dictionary.open;
        right.append(share);
        right.append(open);

        toolbar.append(left);
        toolbar.append(right);
        dom.append(toolbar);
      } else {
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
});
