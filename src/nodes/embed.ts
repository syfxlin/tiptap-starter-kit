import { Editor, mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { Node as PNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { unwrap, wrap } from "../extensions/markdown/plugins/wrap";
import { InnerResizerView } from "../extensions/node-view/inner-resizer";
import { parseAttributes, setAttributes } from "../utils/editor";
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
  match: (props: { editor: Editor; view: InnerResizerView; node: PNode; element: HTMLIFrameElement }) => string | boolean | undefined | null;
  render: (props: { editor: Editor; view: InnerResizerView; node: PNode; element: HTMLIFrameElement }) => void;
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
      items: [
        {
          name: "GitHub Gist",
          match: ({ node }) => {
            return node.attrs.src?.match(/(?:https?:\/\/)?gist\.github\.?com\/?(.*)$/i);
          },
          render: ({ editor, view, node, element }) => {
            const match = node.attrs.src?.match(/(?:https?:\/\/)?gist\.github\.?com\/?(.*)$/i);
            if (!match) {
              return;
            }
            window.addEventListener("message", (e) => {
              if (e.data?.type === "resize" && e.data?.value) {
                if (Math.abs(node.attrs.height - e.data.value) > 5) {
                  setAttributes(editor, view.getPos, {
                    ...node.attrs,
                    height: e.data.value,
                  });
                }
              }
            });
            element.src = `
              data:text/html;charset=utf-8,
              <head>
                <base target='_blank' />
                <title>GitHub Gist</title>
              </head>
              <body>
                <script src="https://gist.github.com/${match[1]}.js"></script>
                <script>
                  window.addEventListener("load", () => {
                    window.parent.postMessage({ type: "resize", value: document.body.scrollHeight }, "*");
                  });
                </script>
              </body>
            `;
          },
        },
      ],
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
      onInit: ({ editor, view }) => {
        const ifr = document.createElement("iframe");
        for (const [key, value] of Object.entries(mergeAttributes(view.HTMLAttributes))) {
          if (value !== undefined && value !== null) {
            ifr.setAttribute(key, value);
          }
        }
        ifr.src = view.node.attrs.src ?? "";
        view.$root.append(ifr);
        for (const item of this.options.items) {
          if (item.match({ editor, view, node: view.node, element: ifr })) {
            item.render({ editor, view, node: view.node, element: ifr });
            break;
          }
        }
      },
      onUpdate: ({ editor, view }) => {
        const ifr = view.$root.firstElementChild as HTMLIFrameElement;
        if (ifr) {
          const src = view.node.attrs.src ?? "";
          if (ifr.getAttribute("src") !== src) {
            ifr.src = src;
          }
          for (const item of this.options.items) {
            if (item.match({ editor, view, node: view.node, element: ifr })) {
              item.render({ editor, view, node: view.node, element: ifr });
              break;
            }
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
        find: /(:embed\{([^}]+)\})/,
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
