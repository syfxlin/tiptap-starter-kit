import { Link as TLink, LinkOptions as TLinkOptions } from "@tiptap/extension-link";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { FloatMenuItemStorage } from "../extensions/float-menu/menu";
import { FloatMenuView } from "../extensions/float-menu/view";
import { MarkMarkdownStorage } from "../extensions/markdown";
import { icon } from "../utils/icons";

export interface LinkOptions extends TLinkOptions {
  dictionary: {
    name: string;
    inputLink: string;
    openLink: string;
    deleteLink: string;
  };
}

export const Link = TLink.extend<LinkOptions>({
  name: "link",
  addOptions() {
    return {
      ...this.parent?.(),
      openOnClick: false,
      dictionary: {
        name: "Link",
        inputLink: "Enter link",
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
      markdown: {
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
      },
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("link"),
            shortcut: "Mod-K",
            active: editor => editor.isActive(this.name),
            action: editor => editor.chain().toggleLink({ href: "" }).setTextSelection(editor.state.selection.to - 1).run(),
          },
        ],
      },
    } satisfies MarkMarkdownStorage & FloatMenuItemStorage;
  },
  addProseMirrorPlugins() {
    return [
      ...TLink.config.addProseMirrorPlugins?.apply(this) ?? [],
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
            const href = view.createInput({
              id: "href",
              name: this.options.dictionary.inputLink,
              onEnter: (value) => {
                editor.chain()
                  .extendMarkRange(this.name)
                  .updateAttributes(this.name, { href: value })
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
              id: "open",
              name: this.options.dictionary.openLink,
              icon: icon("open"),
              onClick: () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.href) {
                  window.open(attrs.href, attrs.target);
                }
              },
            });

            const remove = view.createButton({
              id: "remove",
              name: this.options.dictionary.deleteLink,
              icon: icon("remove"),
              onClick: () => {
                editor.chain().unsetLink().run();
              },
            });

            const form = view.createForm();
            const action = view.createAction();
            root.append(form);
            form.append(href);
            form.append(action);
            action.append(open);
            action.append(remove);
          },
          onUpdate: ({ editor, root }) => {
            const href = root.querySelector("input") as HTMLInputElement;
            if (href) {
              href.value = editor.getAttributes(this.name).href ?? "";
            }
          },
        }),
      }),
    ];
  },
});
