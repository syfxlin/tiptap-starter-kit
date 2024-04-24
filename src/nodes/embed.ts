import { Editor, Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { Node as PNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { parseAttributes } from "../utils/editor";
import { FloatMenuView } from "../extensions/float-menu/view";
import { icon } from "../utils/icons";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { InnerResizerView } from "../extensions/node-view/inner-resizer";
import { unwrap, wrap } from "../extensions/markdown/plugins/wrap";

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
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputEmbed: string;
    openEmbed: string;
    deleteEmbed: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
  };
}

export const Embed = Node.create<EmbedOptions>({
  name: "embed",
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
  },
  addOptions() {
    return {
      items: [],
      inline: false,
      HTMLAttributes: {},
      dictionary: {
        name: "Embed",
        inputEmbed: "Enter or paste embed",
        openEmbed: "Open embed",
        deleteEmbed: "Delete embed",
        alignLeft: "Left alignment",
        alignCenter: "Center alignment",
        alignRight: "Right alignment",
      },
    };
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      align: {
        default: "center",
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
        hooks: {
          afterParse: root => this.options.inline ? root : unwrap(root, node => node.type === "textDirective" && node.name === this.name),
          beforeSerialize: root => this.options.inline ? root : wrap(root, node => node.type === "textDirective" && node.name === this.name),
        },
      },
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("embed"),
            keywords: "embed,iframe,qrk",
            action: editor => editor.chain().setEmbed({ src: "" }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
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
    return InnerResizerView.create({
      HTMLAttributes: this.options.HTMLAttributes,
      onInit: ({ view }) => {
        const ifr = document.createElement("iframe");
        for (const [key, value] of Object.entries(mergeAttributes(view.HTMLAttributes))) {
          if (value !== undefined && value !== null) {
            ifr.setAttribute(key, value);
          }
        }
        ifr.src = view.node.attrs.src ?? "";
        view.$root.append(ifr);
      },
      onUpdate: ({ view }) => {
        const ifr = view.$root.firstElementChild as HTMLIFrameElement;
        if (ifr) {
          const src = view.node.attrs.src ?? "";
          if (ifr.getAttribute("src") !== src) {
            ifr.src = src;
          }
        }
      },
    });
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
            const alignLeft = view.createButton({
              name: this.options.dictionary.alignLeft,
              view: icon("align-left"),
              onClick: () => editor.chain().updateAttributes(this.name, { align: "left" }).run(),
            });
            const alignCenter = view.createButton({
              name: this.options.dictionary.alignCenter,
              view: icon("align-center"),
              onClick: () => editor.chain().updateAttributes(this.name, { align: "center" }).run(),
            });
            const alignRight = view.createButton({
              name: this.options.dictionary.alignRight,
              view: icon("align-right"),
              onClick: () => editor.chain().updateAttributes(this.name, { align: "right" }).run(),
            });

            element.append(href.input);
            element.append(alignLeft.button);
            element.append(alignCenter.button);
            element.append(alignRight.button);
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
