import { Link as TLink, LinkOptions as TLinkOptions } from "@tiptap/extension-link";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { FloatMenuView } from "../extensions/float-menu/view";
import * as icons from "../icons";
import { link } from "../icons";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";

export interface LinkOptions extends TLinkOptions {
  dictionary: {
    name: string;
    inputLink: string;
    openLink: string;
    deleteLink: string;
  };
}

export const Link = TLink.extend<LinkOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      dictionary: {
        name: "Link",
        inputLink: "Enter or paste link",
        openLink: "Open link",
        deleteLink: "Delete link",
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        return this.editor
          .chain()
          .toggleLink({ href: "" })
          .setTextSelection(this.editor.state.selection.to - 1)
          .run();
      },
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: node => node.type === "link",
        apply: (state, node, type) => {
          const url = node.url as string;
          const title = node.title as string;
          state.openMark(type, { href: url, title });
          state.next(node.children);
          state.closeMark(type);
        },
      },
      serializer: {
        match: mark => mark.type.name === this.name,
        apply: (state, mark) => {
          state.withMark(mark, {
            type: "link",
            title: mark.attrs.title,
            url: mark.attrs.href,
          });
        },
      },
      floatMenu: {
        name: this.options.dictionary.name,
        icon: link,
        shortcut: "Mod-K",
        active: editor => editor.isActive(this.name),
        disable: editor => !editor.schema.marks[this.name],
        onClick: editor => editor.chain().toggleLink({ href: "" }).setTextSelection(editor.state.selection.to - 1).run(),
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
        view: () => new FloatMenuView({
          editor: this.editor,
          show: ({ editor }) => editor.isEditable && editor.state.selection.empty && editor.isActive(this.name),
          tippy: ({ options }) => ({ ...options, onMount: i => i.popper.querySelector("input")?.focus() }),
          onInit: ({ view, editor, element }) => {
            const href = view.createInput({
              name: this.options.dictionary.inputLink,
              onEnter: (value) => {
                editor.chain()
                  .extendMarkRange(this.name)
                  .updateAttributes(this.name, { href: value })
                  .focus()
                  .run();
              },
            });

            const open = view.createButton({
              name: this.options.dictionary.openLink,
              icon: icons.open,
              onClick: () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.href) {
                  window.open(attrs.href, attrs.target);
                }
              },
            });

            const remove = view.createButton({
              name: this.options.dictionary.deleteLink,
              icon: icons.remove,
              onClick: () => {
                editor.chain().unsetLink().run();
              },
            });

            element.append(href.input);
            element.append(open.button);
            element.append(remove.button);
          },
          onUpdate: ({ editor, element }) => {
            const href = element.querySelector("input") as HTMLInputElement;
            if (href) {
              href.value = editor.getAttributes(this.name).href ?? "";
            }
          },
        }),
      }),
    ];
  },
});
