import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import Plyr from "plyr";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { unwrap, wrap } from "../extensions/markdown/plugins/wrap";
import { InnerResizerView } from "../extensions/node-view/inner-resizer";
import { UploaderStorage } from "../extensions/uploader";
import { parseAttributes } from "../utils/editor";
import { icon } from "../utils/icons";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}

export interface AudioOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputSrc: string;
    inputAlt: string;
    inputTitle: string;
    audioOpen: string;
    audioUpload: string;
    audioDelete: string;
  };
}

export const Audio = Node.create<AudioOptions>({
  name: "audio",
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
  },
  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
      dictionary: {
        name: "Audio",
        inputSrc: "Audio link",
        inputAlt: "Audio description",
        inputTitle: "Audio title",
        audioOpen: "Open audio",
        audioUpload: "Upload audio",
        audioDelete: "Delete audio",
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
            icon: icon("audio"),
            keywords: "audio,yp",
            action: editor => editor.chain().setAudio({ src: "" }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      align: {
        default: "center",
      },
      width: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "audio",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      mergeAttributes({ controls: "true" }, this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
  addNodeView() {
    return InnerResizerView.create({
      resize: ["width"],
      HTMLAttributes: this.options.HTMLAttributes,
      onInit: ({ view }) => {
        const ado = document.createElement("audio");
        for (const [key, value] of Object.entries(mergeAttributes(view.HTMLAttributes))) {
          if (value !== undefined && value !== null) {
            ado.setAttribute(key, value);
          }
        }

        ado.src = view.node.attrs.src ?? "";
        ado.title = view.node.attrs.title ?? "";

        view.$root.append(ado);
        view.$root.classList.add("ProseMirror-selectedcard");
        // @ts-expect-error
        view.plyr = new Plyr(ado);
      },
      onUpdate: ({ view }) => {
        const ado = view.$root.querySelector("audio") as HTMLAudioElement;
        if (ado) {
          const src = view.node.attrs.src ?? "";
          const title = view.node.attrs.title ?? "";
          if (ado.getAttribute("src") !== src || ado.getAttribute("title") !== title) {
            // @ts-expect-error
            view.plyr?.destroy();
            const dom = view.$root.querySelector("audio") as HTMLAudioElement;
            dom.src = src;
            dom.title = title;
            // @ts-expect-error
            view.plyr = new Plyr(dom);
          }
        }
      },
      onDestroy: ({ view }) => {
        // @ts-expect-error
        view.plyr?.destroy();
      },
    });
  },
  addCommands() {
    return {
      setAudio: (options) => {
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
        find: /(:audio\{([^}]+)\})/,
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
          tippy: {
            placement: "bottom",
          },
          show: ({ editor }) => {
            return editor.isEditable && editor.isActive(this.name);
          },
          onInit: ({ view, editor, root }) => {
            const src = view.createInput({
              id: "src",
              name: this.options.dictionary.inputSrc,
              onKey: ({ key }) => {
                if (key === "ArrowDown") {
                  const node = root.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  editor.chain().focus().run();
                }
                if (boundary === "right") {
                  const node = root.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
            });
            const alt = view.createInput({
              id: "alt",
              name: this.options.dictionary.inputAlt,
              onKey: ({ key }) => {
                if (key === "ArrowUp") {
                  const node = root.querySelector(`input[name="src"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (key === "ArrowDown") {
                  const node = root.querySelector(`input[name="title"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  const node = root.querySelector(`input[name="src"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (boundary === "right") {
                  const node = root.querySelector(`input[name="title"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
            });
            const title = view.createInput({
              id: "title",
              name: this.options.dictionary.inputTitle,
              onKey: ({ key }) => {
                if (key === "ArrowUp") {
                  const node = root.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  const node = root.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (boundary === "right") {
                  editor.chain().focus().run();
                }
              },
            });

            const open = view.createButton({
              id: "open",
              name: this.options.dictionary.audioOpen,
              icon: icon("open"),
              onClick: () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src, attrs.target);
                }
              },
            });
            const upload = view.createUpload({
              id: "upload",
              name: this.options.dictionary.audioUpload,
              icon: icon("upload"),
              accept: "audio/*",
              onUpload: (element) => {
                const uploader = this.editor.storage.uploader as UploaderStorage;
                if (element.files && uploader) {
                  uploader.upload(element.files).then(items => items.forEach((item) => {
                    if (item.type.startsWith("audio")) {
                      editor.chain().setAudio({ src: item.url, alt: item.name }).run();
                    }
                  }));
                }
              },
            });
            const remove = view.createButton({
              id: "remove",
              name: this.options.dictionary.audioDelete,
              icon: icon("remove"),
              onClick: () => {
                editor.chain().deleteSelection().run();
              },
            });

            const form = view.createForm();
            const action = view.createAction();

            form.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                editor
                  .chain()
                  .updateAttributes(this.name, {
                    src: src.querySelector("input")!.value,
                    alt: alt.querySelector("input")!.value,
                    title: title.querySelector("input")!.value,
                  })
                  .focus()
                  .run();
              }
            });

            form.append(src);
            form.append(alt);
            form.append(title);
            form.append(action);
            action.append(open);
            action.append(upload);
            action.append(remove);
            root.append(form);
          },
          onMount: ({ root }) => {
            const src = root.querySelector(`input[name="src"]`) as HTMLInputElement;
            if (src) {
              src.focus();
            }
          },
          onUpdate: ({ editor, root }) => {
            const attrs = editor.getAttributes(this.name);

            const src = root.querySelector(`input[name="src"]`) as HTMLInputElement;
            const alt = root.querySelector(`input[name="alt"]`) as HTMLInputElement;
            const title = root.querySelector(`input[name="title"]`) as HTMLInputElement;

            src.value = attrs.src ?? "";
            alt.value = attrs.alt ?? "";
            title.value = attrs.title ?? "";
          },
        }),
      }),
    ];
  },
});
