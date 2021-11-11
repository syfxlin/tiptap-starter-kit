import { Extension } from "@tiptap/core";
import { defaultUploader } from "./default-uploader";
import { Plugin, PluginKey } from "prosemirror-state";

export type UploaderFn = (files: FileList) => Promise<
  {
    name: string;
    size: number;
    url: string;
    type: string;
  }[]
>;

export type UploaderOptions = {
  uploader: UploaderFn;
};

export const Uploader = Extension.create<UploaderOptions, UploaderOptions>({
  name: "uploader",
  addOptions() {
    return {
      uploader: defaultUploader,
    };
  },
  addStorage() {
    return {
      uploader: this.options.uploader,
    };
  },
  addProseMirrorPlugins() {
    const upload = (files: FileList) => {
      this.storage.uploader(files).then((items) => {
        items.map((item) => {
          if (item.type.startsWith("image")) {
            this.editor
              .chain()
              .setImage({
                src: item.url,
                alt: item.name,
              })
              .run();
          } else if (item.type.startsWith("audio")) {
            this.editor
              .chain()
              .setAudio({
                src: item.url,
                title: item.name,
              })
              .run();
          } else if (item.type.startsWith("video")) {
            this.editor
              .chain()
              .setVideo({
                src: item.url,
                title: item.name,
              })
              .run();
          }
        });
      });
    };
    return [
      new Plugin({
        key: new PluginKey(`${this.name}Handler`),
        props: {
          handlePaste: (view, event) => {
            const editable = this.editor.isEditable;
            const { clipboardData } = event;
            if (
              !editable ||
              !clipboardData ||
              clipboardData.files.length === 0
            ) {
              return false;
            }
            upload(clipboardData.files);
            return true;
          },
          handleDrop: (view, event) => {
            if (!(event instanceof DragEvent) || !this.editor.isEditable) {
              return false;
            }
            const { files } = event.dataTransfer ?? {};
            if (!files || files.length <= 0) {
              return false;
            }
            upload(files);
            return true;
          },
        },
      }),
    ];
  },
});
