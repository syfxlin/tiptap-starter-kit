import { Link as TLink } from "@tiptap/extension-link";
import { MarkMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import { buttonView, inputView } from "../extensions/float-menu/utils";
import { Delete, Share } from "@icon-park/svg";

export const Link = TLink.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-k": () =>
        this.editor
          .chain()
          .toggleLink({ href: "" })
          .setTextSelection(this.editor.state.selection.to - 1)
          .run(),
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "link",
        runner: (state, node, type) => {
          const url = node.url as string;
          const title = node.title as string;
          state
            .openMark(type, { href: url, title })
            .next(node.children)
            .closeMark(type);
        },
      },
      serializer: {
        match: (mark) => mark.type.name === this.name,
        runner: (state, mark) => {
          state.withMark(mark, {
            type: "link",
            title: mark.attrs.title,
            url: mark.attrs.href,
          });
        },
      },
    } as MarkMarkdownStorage;
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        view: () =>
          new FloatMenuView({
            editor: this.editor,
            shouldShow: ({ editor }) =>
              editor.isEditable &&
              editor.state.selection.empty &&
              editor.isActive(this.name),
            init: (dom, editor) => {
              const href = inputView({
                placeholder: "输入或粘贴链接",
              });

              const open = buttonView({
                name: "打开链接",
                icon: Share({}),
              });
              open.button.addEventListener("click", () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.href) {
                  window.open(attrs.href, attrs.target);
                }
              });

              const remove = buttonView({
                name: "删除链接",
                icon: Delete({}),
              });
              remove.button.addEventListener("click", () => {
                editor.chain().unsetLink().run();
              });

              dom.append(href.input);
              dom.append(open.button);
              dom.append(remove.button);
              dom.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                  editor
                    .chain()
                    .extendMarkRange(this.name)
                    .updateAttributes(this.name, {
                      href: href.input.value,
                    })
                    .focus()
                    .run();
                }
              });
            },
            update: (dom, { editor }) => {
              const attrs = editor.getAttributes(this.name);
              const href = dom.querySelector("input") as HTMLInputElement;
              href.value = attrs.href;
            },
            tippyOptions: {
              onMount(instance) {
                instance.popper.querySelector("input")?.focus();
              },
            },
          }),
      }),
    ];
  },
});
