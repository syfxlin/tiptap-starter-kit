import { Link as TLink, LinkOptions as TLinkOptions } from "@tiptap/extension-link";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { MarkMarkdownStorage } from "../extensions/markdown";

export interface LinkOptions extends TLinkOptions {
  dictionary: {
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
    } satisfies MarkMarkdownStorage;
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-float-menu`),
      }),
    ];
  },
});
