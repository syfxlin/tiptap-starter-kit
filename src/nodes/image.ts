import { Image as TImage, ImageOptions as TImageOptions } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { icon } from "../utils/icons";
import { UploaderItemStorage, UploaderStorage } from "../extensions/uploader";

export interface ImageOptions extends TImageOptions {
  dictionary: {
    name: string;
    empty: string;
    error: string;
    loading: string;
    input: {
      src: string;
      alt: string;
      title: string;
    };
    image: {
      open: string;
      upload: string;
      delete: string;
    };
  };
}

export const Image = TImage.extend<ImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Image",
        empty: "Add image",
        error: "Error loading image",
        loading: "Loading image...",
        input: {
          src: "Enter or paste link",
          alt: "Image description",
          title: "Image title",
        },
        image: {
          open: "Open image",
          upload: "Upload image",
          delete: "Delete image",
        },
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "image",
        apply: (state, node, type) => {
          const src = node.url as string;
          const alt = node.alt as string;
          const title = node.title as string;
          state.addNode(type, {
            src,
            alt,
            title,
          });
        },
      },
      serializer: {
        match: node => node.type.name === this.name,
        apply: (state, node) => {
          state.addNode({
            type: "image",
            title: node.attrs.title,
            url: node.attrs.src,
            alt: node.attrs.alt,
          });
        },
      },
      uploader: {
        match: (_editor, data) => data.type.startsWith("image"),
        apply: (editor, data) => editor.chain().setImage({ src: data.url, alt: data.name }).run(),
      },
      blockMenu: {
        id: this.name,
        name: this.options.dictionary.name,
        icon: icon("image"),
        keywords: "image,picture,tp,zp",
        action: editor => editor.chain().setImage({ src: "" }).focus().run(),
      },
    } satisfies NodeMarkdownStorage & UploaderItemStorage & BlockMenuItemStorage;
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      const img = document.createElement("img");

      dom.classList.add("ProseMirror-image");
      img.classList.add("ProseMirror-content");
      for (const [key, value] of Object.entries(this.options.HTMLAttributes)) {
        img.setAttribute(key, value);
      }

      img.src = node.attrs.src ?? "";
      img.alt = node.attrs.alt ?? "";
      img.title = node.attrs.title ?? "";

      dom.setAttribute("data-loading", this.options.dictionary.loading);
      img.addEventListener("load", () => {
        dom.removeAttribute("data-loading");
      });
      img.addEventListener("error", () => {
        if (img.getAttribute("src")) {
          dom.setAttribute("data-loading", this.options.dictionary.error);
        } else {
          dom.setAttribute("data-loading", this.options.dictionary.empty);
        }
      });

      dom.append(img);
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          img.src = updatedNode.attrs.src ?? "";
          img.alt = updatedNode.attrs.alt ?? "";
          img.title = updatedNode.attrs.title ?? "";
        },
      };
    };
  },
  addProseMirrorPlugins() {
    return [
      ...this.parent?.() ?? [],
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: () => new FloatMenuView({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.isActive(this.name),
          tippy: ({ options }) => ({ ...options, onMount: i => (i.popper.querySelector(`input[name="src"]`) as HTMLInputElement)?.focus() }),
          onInit: ({ view, editor, element }) => {
            const group = view.createGroup("column");

            const src = view.createInput({
              id: "src",
              name: this.options.dictionary.input.src,
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
              name: this.options.dictionary.input.alt,
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
              name: this.options.dictionary.input.title,
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
              name: this.options.dictionary.image.open,
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
              name: this.options.dictionary.image.upload,
              view: icon("upload"),
              accept: "image/*",
              onUpload: (element) => {
                const uploader = this.editor.storage.uploader as UploaderStorage;
                if (element.files && uploader) {
                  uploader.upload(element.files).then(items => items.forEach((item) => {
                    if (item.type.startsWith("image")) {
                      editor.chain().setImage({ src: item.url, alt: item.name }).run();
                    }
                  }));
                }
              },
            });
            const remove = view.createButton({
              id: "remove",
              name: this.options.dictionary.image.delete,
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
