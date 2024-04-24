import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import Plyr from "plyr";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { icon } from "../utils/icons";
import { parseAttributes } from "../utils/editor";
import { FloatMenuView } from "../extensions/float-menu/view";
import { UploaderStorage } from "../extensions/uploader";
import { InnerResizerView } from "../extensions/node-view/inner-resizer";
import { unwrap, wrap } from "../extensions/markdown/plugins/wrap";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}

export interface VideoOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
    inputSrc: string;
    inputAlt: string;
    inputTitle: string;
    videoOpen: string;
    videoUpload: string;
    videoDelete: string;
  };
}

export const Video = Node.create<VideoOptions>({
  name: "video",
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
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
  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
      dictionary: {
        name: "Video",
        inputSrc: "Enter or paste link",
        inputAlt: "Video description",
        inputTitle: "Video title",
        videoOpen: "Open video",
        videoUpload: "Upload video",
        videoDelete: "Delete video",
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
            icon: icon("video"),
            keywords: "video,sp",
            action: editor => editor.chain().setVideo({ src: "" }).focus().run(),
          },
        ],
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
  },
  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes({ controls: "true" }, this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
  addNodeView() {
    return InnerResizerView.create({
      resize: ["width"],
      HTMLAttributes: this.options.HTMLAttributes,
      onInit: ({ view }) => {
        const vdo = document.createElement("video");
        for (const [key, value] of Object.entries(mergeAttributes(view.HTMLAttributes))) {
          if (value !== undefined && value !== null) {
            vdo.setAttribute(key, value);
          }
        }

        vdo.src = view.node.attrs.src ?? "";
        vdo.title = view.node.attrs.title ?? "";

        view.$root.append(vdo);
        view.$root.classList.add("ProseMirror-selectedcard");
        // @ts-expect-error
        view.plyr = new Plyr(vdo);
      },
      onUpdate: ({ view }) => {
        const vdo = view.$root.querySelector("video") as HTMLVideoElement;
        if (vdo) {
          const src = view.node.attrs.src ?? "";
          const title = view.node.attrs.title ?? "";
          if (vdo.getAttribute("src") !== src || vdo.getAttribute("title") !== title) {
            // @ts-expect-error
            view.plyr?.destroy();
            const dom = view.$root.querySelector("video") as HTMLVideoElement;
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
      setVideo: (options) => {
        return ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          });
      },
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /(:video{([^}]+)})/,
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
          tippy: ({ options }) => ({ ...options, onMount: i => (i.popper.querySelector(`input[name="src"]`) as HTMLInputElement)?.focus() }),
          onInit: ({ view, editor, element }) => {
            const group = view.createGroup("column");

            const src = view.createInput({
              id: "src",
              name: this.options.dictionary.inputSrc,
              onKey: ({ key }) => {
                if (key === "ArrowDown") {
                  const node = element.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  editor.chain().focus().run();
                }
                if (boundary === "right") {
                  const node = element.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
            });
            const alt = view.createInput({
              id: "alt",
              name: this.options.dictionary.inputAlt,
              onKey: ({ key }) => {
                if (key === "ArrowUp") {
                  const node = element.querySelector(`input[name="src"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (key === "ArrowDown") {
                  const node = element.querySelector(`input[name="title"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  const node = element.querySelector(`input[name="src"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (boundary === "right") {
                  const node = element.querySelector(`input[name="title"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
            });
            const title = view.createInput({
              id: "title",
              name: this.options.dictionary.inputTitle,
              onKey: ({ key }) => {
                if (key === "ArrowUp") {
                  const node = element.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
              },
              onBoundary: (boundary) => {
                if (boundary === "left") {
                  const node = element.querySelector(`input[name="alt"]`) as HTMLInputElement;
                  node?.focus();
                }
                if (boundary === "right") {
                  editor.chain().focus().run();
                }
              },
            });

            const open = view.createButton({
              id: "open",
              name: this.options.dictionary.videoOpen,
              view: icon("open"),
              onClick: () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src, attrs.target);
                }
              },
            });
            const upload = view.createUpload({
              id: "upload",
              name: this.options.dictionary.videoUpload,
              view: icon("upload"),
              accept: "video/*",
              onUpload: (element) => {
                const uploader = this.editor.storage.uploader as UploaderStorage;
                if (element.files && uploader) {
                  uploader.upload(element.files).then(items => items.forEach((item) => {
                    if (item.type.startsWith("video")) {
                      editor.chain().setVideo({ src: item.url, alt: item.name }).run();
                    }
                  }));
                }
              },
            });
            const remove = view.createButton({
              id: "remove",
              name: this.options.dictionary.videoDelete,
              view: icon("remove"),
              onClick: () => {
                editor.chain().deleteSelection().run();
              },
            });

            group.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                editor
                  .chain()
                  .updateAttributes(this.name, {
                    src: src.input.value,
                    alt: alt.input.value,
                    title: title.input.value,
                  })
                  .focus()
                  .run();
              }
            });

            group.append(src.input);
            group.append(alt.input);
            group.append(title.input);
            element.append(group);
            element.append(open.button);
            element.append(upload.button);
            element.append(remove.button);
          },
          onUpdate: ({ editor, element }) => {
            const attrs = editor.getAttributes(this.name);

            const src = element.querySelector(`input[name="src"]`) as HTMLInputElement;
            const alt = element.querySelector(`input[name="alt"]`) as HTMLInputElement;
            const title = element.querySelector(`input[name="title"]`) as HTMLInputElement;

            src.value = attrs.src ?? "";
            alt.value = attrs.alt ?? "";
            title.value = attrs.title ?? "";
          },
        }),
      }),
    ];
  },
});
