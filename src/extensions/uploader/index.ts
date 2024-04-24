import { Editor, Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface UploaderData {
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface UploaderItem {
  match: (editor: Editor, data: UploaderData) => boolean;
  apply: (editor: Editor, data: UploaderData) => void;
}

export interface UploaderItemStorage {
  uploader: UploaderItem | Array<UploaderItem>;
}

export interface UploaderOptions {
  upload: (files: FileList) => Promise<Array<UploaderData>>;
}

export interface UploaderStorage {
  upload: (files: FileList) => Promise<Array<UploaderData>>;
}

export const Uploader = Extension.create<UploaderOptions, UploaderStorage>({
  name: "uploader",
  addOptions() {
    return {
      upload: (files) => {
        const items: Array<File> = [];
        for (let i = 0; i < files.length; i++) {
          const file = files.item(i);
          if (!file) {
            continue;
          }
          items.push(file);
        }
        const upload = (file: File) => {
          return new Promise<UploaderData>((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              url: reader.result as string,
            }), false);
            reader.readAsDataURL(file);
          });
        };
        return Promise.all(items.map(item => upload(item)));
      },
    };
  },
  addStorage() {
    return {
      upload: this.options.upload,
    };
  },
  addProseMirrorPlugins() {
    const upload = (files: FileList) => {
      this.options.upload(files).then(items => items.forEach((item) => {
        for (const storage of Object.values(this.editor.storage)) {
          if (storage?.uploader) {
            for (const uploader of Array.isArray(storage.uploader) ? storage.uploader : [storage.uploader]) {
              if (uploader.match(this.editor, item)) {
                uploader.apply(this.editor, item);
                return;
              }
            }
          }
        }
      }));
    };
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-handler`),
        props: {
          handlePaste: (_view, event) => {
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
          handleDrop: (_view, event) => {
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
