import { Extension } from "@tiptap/core";
import { defaultUploader } from "./default-uploader";
import { Plugin } from "prosemirror-state";

export type UploaderFn = (files: FileList) => Promise<
  {
    name: string;
    size: number;
    url: string;
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
    return [
      new Plugin({
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
            this.storage.uploader(clipboardData.files).then((items) => {
              // TODO: 按照文件属性分配
              items.map((item) =>
                this.editor
                  .chain()
                  .setImage({
                    src: item.url,
                    alt: item.name,
                  })
                  .run()
              );
            });
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
            this.storage.uploader(files).then((items) => {
              items.map((item) =>
                this.editor
                  .chain()
                  .setImage({
                    src: item.url,
                    alt: item.name,
                  })
                  .run()
              );
            });
            return true;
          },
        },
      }),
    ];
  },
});
