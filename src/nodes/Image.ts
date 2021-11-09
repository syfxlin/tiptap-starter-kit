import { Image as TImage } from "@tiptap/extension-image";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { isNodeActive } from "@tiptap/core";
import { buttonView, inputView } from "../extensions/float-menu/utils";
import { Delete, Share } from "@icon-park/svg";
import { css } from "@emotion/css";

export const Image = TImage.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: true,
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
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            shouldShow: ({ editor }) =>
              editor.isEditable && isNodeActive(editor.state, this.name),
            init: (dom, editor) => {
              const group = document.createElement("div");
              group.classList.add(css`
                display: flex;
                flex-direction: column;

                > * {
                  margin-top: 0.5em;

                  &:first-child {
                    margin-top: 0;
                  }
                }
              `);

              const src = inputView({
                id: "src",
                placeholder: "输入或粘贴链接",
              });

              const alt = inputView({
                id: "alt",
                placeholder: "描述",
              });

              const title = inputView({
                id: "title",
                placeholder: "标题",
              });

              const open = buttonView({
                name: "打开图片",
                icon: Share({}),
              });
              open.button.addEventListener("click", () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src);
                }
              });

              const remove = buttonView({
                name: "删除图片",
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
              dom.append(open.button);
              dom.append(remove.button);
            },
            update: (dom, { editor }) => {
              const attrs = editor.getAttributes(this.name);

              const src = dom.querySelector("input.id-src") as HTMLInputElement;
              src.value = attrs.src;

              const alt = dom.querySelector("input.id-alt") as HTMLInputElement;
              alt.value = attrs.alt;

              const title = dom.querySelector(
                "input.id-title"
              ) as HTMLInputElement;
              title.value = attrs.title;
            },
          }),
      }),
    ];
  },
});
