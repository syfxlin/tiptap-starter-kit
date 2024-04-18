import { Editor, Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { Node as PNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { createResizer, parseAttributes, setAttributes } from "../utils/editor";
import { FloatMenuView } from "../extensions/float-menu/view";
import { icon } from "../utils/icons";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

export interface EmbedItem {
  name: string;
  match: (props: { editor: Editor; node: PNode; element: HTMLIFrameElement }) => string | boolean | undefined | null;
  render: (props: { editor: Editor; node: PNode; element: HTMLIFrameElement }) => void;
}

export interface EmbedOptions {
  items: Array<EmbedItem>;
  HTMLAttributes: Record<string, any>;
  dictionary: {
    inputEmbed: string;
    openEmbed: string;
    deleteEmbed: string;
  };
}

export const Embed = Node.create<EmbedOptions>({
  name: "embed",
  group: "block",
  addOptions() {
    return {
      items: [],
      HTMLAttributes: {},
      dictionary: {
        name: "Embed",
        inputEmbed: "Enter or paste embed",
        openEmbed: "Open embed",
        deleteEmbed: "Delete embed",
      },
    };
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        parser: {
          match: node => node.type === "textDirective" && node.name === this.name,
          apply: (state, node, type) => {
            state.addNode(type, node.attributes);
          },
        },
        serializer: {
          match: node => node.type.name === this.name,
          apply: (state, node) => {
            state.addNode({
              type: "textDirective",
              name: this.name,
              attributes: node.attrs,
            });
          },
        },
      },
    } satisfies NodeMarkdownStorage;
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
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("div");
      const ifr = document.createElement("iframe");

      for (const [key, value] of Object.entries(this.options.HTMLAttributes)) {
        if (value !== undefined && value !== null) {
          dom.setAttribute(key, value);
          ifr.setAttribute(key, value);
        }
      }

      dom.setAttribute("data-type", this.name);
      dom.classList.add("ProseMirror-selectedcard");

      ifr.src = node.attrs.src ?? "";
      dom.style.width = node.attrs.width ? `${node.attrs.width}px` : "";
      dom.style.height = node.attrs.height ? `${node.attrs.height}px` : "";

      dom.append(ifr);
      createResizer(dom, (size) => {
        setAttributes(editor, getPos, { ...node.attrs, ...size });
      });
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          const src = updatedNode.attrs.src ?? "";
          if (ifr.getAttribute("src") !== src) {
            ifr.src = src;
          }
          const width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : "";
          if (dom.style.width !== width) {
            dom.style.width = width;
          }
          const height = updatedNode.attrs.height ? `${updatedNode.attrs.height}px` : "";
          if (dom.style.height !== height) {
            dom.style.height = height;
          }
          return true;
        },
      };
    };
  },
  addCommands() {
    return {
      setEmbed: (options) => {
        return ({ commands }) => commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /(:embed{([^}]+)})/,
        type: this.type,
        getAttributes: match => parseAttributes(match[2]),
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: FloatMenuView.create({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.isActive(this.name),
          tippy: ({ options }) => ({ ...options, onMount: i => i.popper.querySelector("input")?.focus() }),
          onInit: ({ view, editor, element }) => {
            const href = view.createInput({
              name: this.options.dictionary.inputEmbed,
              onEnter: (value) => {
                editor.chain()
                  .updateAttributes(this.name, { src: value })
                  .focus()
                  .run();
              },
              onBoundary: (value) => {
                editor.chain()
                  .updateAttributes(this.name, { value })
                  .setTextSelection(editor.state.selection.from + (value === "left" ? -1 : 1))
                  .focus()
                  .run();
              },
            });

            const open = view.createButton({
              name: this.options.dictionary.openEmbed,
              view: icon("open"),
              onClick: () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src, attrs.target);
                }
              },
            });

            const remove = view.createButton({
              name: this.options.dictionary.deleteEmbed,
              view: icon("remove"),
              onClick: () => {
                editor.chain().deleteSelection().focus().run();
              },
            });

            element.append(href.input);
            element.append(open.button);
            element.append(remove.button);
          },
          onUpdate: ({ editor, element }) => {
            const href = element.querySelector("input") as HTMLInputElement;
            if (href) {
              href.value = editor.getAttributes(this.name).src ?? "";
            }
          },
        }),
      }),
    ];
  },
});
