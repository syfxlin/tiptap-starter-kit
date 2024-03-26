import { Image as TImage, ImageOptions as TImageOptions } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeMarkdownStorage } from "../extensions/markdown";
import { BlockMenuItemStorage } from "../extensions/block-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { icon } from "../utils/icons";

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
      blockMenu: {
        id: this.name,
        name: this.options.dictionary.name,
        icon: icon("image"),
        keywords: "image,picture,tp,zp",
        action: editor => editor.chain().setImage({ src: "" }).focus().run(),
      },
    } satisfies NodeMarkdownStorage & BlockMenuItemStorage;
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
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: () => new FloatMenuView({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.isActive(this.name),
          onInit: ({ view, editor, element }) => {
            const group = view.createGroup("column");

            const src = view.createInput({
              id: "src",
              name: this.options.dictionary.input.src,
            });
            const alt = view.createInput({
              id: "alt",
              name: this.options.dictionary.input.alt,
            });
            const title = view.createInput({
              id: "title",
              name: this.options.dictionary.input.title,
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
              onUpload: () => {
                console.log("upload");
                // TODO: upload
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
