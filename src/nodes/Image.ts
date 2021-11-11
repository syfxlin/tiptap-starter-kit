import {
  Image as TImage,
  ImageOptions as TImageOptions,
} from "@tiptap/extension-image";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin, PluginKey } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { isNodeActive } from "@tiptap/core";
import {
  buttonView,
  groupView,
  inputView,
  uploadView,
} from "../extensions/float-menu/utils";
import { Delete, Share, Upload } from "@icon-park/svg";
import { css } from "@emotion/css";

export type ImageOptions = TImageOptions & {
  dictionary: {
    empty: string;
    error: string;
    inputSrc: string;
    inputAlt: string;
    inputTitle: string;
    uploadImage: string;
    openImage: string;
    deleteImage: string;
  };
};

export const Image = TImage.extend<ImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: true,
      dictionary: {
        empty: "添加图片",
        error: "加载图片出错",
        inputSrc: "输入或粘贴链接",
        inputAlt: "描述",
        inputTitle: "标题",
        uploadImage: "上传",
        openImage: "打开图片",
        deleteImage: "删除图片",
      },
    };
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.classList.add(css`
        display: inline-flex;
        max-width: 100%;

        &::before {
          content: none;
          color: var(--tiptap-color-text);
          background-color: var(--tiptap-color-background-secondly);
          border: 1px solid var(--tiptap-color-border);
          padding: 0.2em 1em;
          border-radius: 4px;
          display: block;
        }

        &.empty {
          resize: none;

          img {
            display: none;
          }

          &::before {
            content: "${this.options.dictionary.empty}";
          }
        }

        &.error {
          resize: none;

          img {
            display: none;
          }

          &::before {
            content: "${this.options.dictionary.error}";
          }
        }
      `);
      const img = document.createElement("img");
      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        img.setAttribute(key, value);
      });
      img.src = node.attrs.src || "";
      img.alt = node.attrs.alt || "";
      img.title = node.attrs.title || "";

      img.addEventListener("load", () => {
        dom.classList.remove("error");
        dom.classList.remove("empty");
      });
      img.addEventListener("error", () => {
        dom.classList.remove("empty");
        dom.classList.remove("error");
        if (!!img.getAttribute("src")) {
          dom.classList.add("error");
        } else {
          dom.classList.add("empty");
        }
      });

      dom.append(img);
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          img.src = updatedNode.attrs.src || "";
          img.alt = updatedNode.attrs.alt || "";
          img.title = updatedNode.attrs.title || "";
        },
      };
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "image",
        runner: (state, node, type) => {
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
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "image",
            title: node.attrs.title,
            url: node.attrs.src,
            alt: node.attrs.alt,
          });
        },
      },
    } as NodeMarkdownStorage;
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

              const alt = inputView({
                id: "alt",
                placeholder: this.options.dictionary.inputAlt,
              });

              const title = inputView({
                id: "title",
                placeholder: this.options.dictionary.inputTitle,
              });

              const upload = uploadView({
                name: this.options.dictionary.uploadImage,
                icon: Upload({}),
              });
              upload.file.addEventListener("change", () => {
                this.editor.storage.uploader
                  .uploader(upload.file.files)
                  .then((items: any[]) => {
                    const item = items[0];
                    this.editor
                      .chain()
                      .updateAttributes(this.name, {
                        src: item.url,
                        alt: item.name,
                      })
                      .setNodeSelection(this.editor.state.selection.from)
                      .focus()
                      .run();
                  });
              });

              const open = buttonView({
                name: this.options.dictionary.openImage,
                icon: Share({}),
              });
              open.button.addEventListener("click", () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src);
                }
              });

              const remove = buttonView({
                name: this.options.dictionary.deleteImage,
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
              dom.append(group);
              dom.append(upload.button);
              dom.append(open.button);
              dom.append(remove.button);
            },
            update: (dom, { editor }) => {
              const attrs = editor.getAttributes(this.name);

              const src = dom.querySelector("input.id-src") as HTMLInputElement;
              src.value = attrs.src || "";

              const alt = dom.querySelector("input.id-alt") as HTMLInputElement;
              alt.value = attrs.alt || "";

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
