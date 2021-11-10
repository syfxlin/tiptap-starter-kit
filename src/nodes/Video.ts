import {
  isNodeActive,
  mergeAttributes,
  Node,
  nodeInputRule,
} from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { attrs } from "./utils";
import { Plugin } from "prosemirror-state";
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
    video: {
      setVideo: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type VideoOptions = {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    inputSrc: string;
    inputTitle: string;
    uploadVideo: string;
    downloadVideo: string;
    deleteVideo: string;
  };
};

export const Video = Node.create<VideoOptions>({
  name: "video",
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
        tag: "video",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
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
        uploadVideo: "上传",
        downloadVideo: "下载视频",
        deleteVideo: "删除视频",
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
      setVideo:
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
        find: /(:video{([^}]+)})/,
        type: this.type,
        getAttributes: (match) => attrs(match[2]),
      }),
    ];
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
                name: this.options.dictionary.uploadVideo,
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
                name: this.options.dictionary.downloadVideo,
                icon: Download({}),
              });
              open.button.addEventListener("click", () => {
                const attrs = editor.getAttributes(this.name);
                if (attrs.src) {
                  window.open(attrs.src);
                }
              });

              const remove = buttonView({
                name: this.options.dictionary.deleteVideo,
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
