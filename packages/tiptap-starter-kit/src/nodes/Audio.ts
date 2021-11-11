import {
  isNodeActive,
  mergeAttributes,
  Node,
  nodeInputRule,
} from "@tiptap/core";
import { attrs } from "./utils";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { Plugin, PluginKey } from "prosemirror-state";
import FloatMenuView from "../extensions/float-menu/FloatMenuView";
import {
  buttonView,
  groupView,
  inputView,
  uploadView,
} from "../extensions/float-menu/utils";
import { Delete, Download, Upload } from "@icon-park/svg";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type AudioOptions = {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    inputSrc: string;
    inputTitle: string;
    uploadAudio: string;
    downloadAudio: string;
    deleteAudio: string;
  };
};

export const Audio = Node.create<AudioOptions>({
  name: "audio",
  inline: true,
  group: "inline",
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `audio`,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      mergeAttributes(
        {
          controls: "true",
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        inputSrc: "输入或粘贴链接",
        inputTitle: "标题",
        uploadAudio: "上传",
        downloadAudio: "下载音频",
        deleteAudio: "删除音频",
      },
    };
  },
  addStorage() {
    return {
      parser: {
        match: (node) =>
          node.type === "textDirective" && node.name === this.name,
        runner: (state, node, type) => {
          state.addNode(type, node.attributes);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "textDirective",
            name: this.name,
            attributes: node.attrs,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /(:audio{([^}]+)})/,
        type: this.type,
        getAttributes: (match) => attrs(match[2]),
      }),
    ];
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

              const title = inputView({
                id: "title",
                placeholder: this.options.dictionary.inputTitle,
              });

              const upload = uploadView({
                name: this.options.dictionary.uploadAudio,
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
                        title: item.name,
                      })
                      .setNodeSelection(this.editor.state.selection.from)
                      .focus()
                      .run();
                  });
              });

              const open = buttonView({
                name: this.options.dictionary.downloadAudio,
                icon: Download({}),
              });
              open.button.addEventListener("click", () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src);
                }
              });

              const remove = buttonView({
                name: this.options.dictionary.deleteAudio,
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
                      title: title.input.value,
                    })
                    .focus()
                    .run();
                }
              });
              group.append(src.input);
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
