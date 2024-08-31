# Uploader extension

Uploader extension is used for file uploads and provides a unified upload API that will also handle paste and drop operations. Other extensions can place upload processing configuration on storage to activate paste and drop support.

## Options

### upload

Unified method of uploading files, the default configuration is to embed the file encoded as base64 in the document.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/uploader/index.ts#L20-L22)
Audio.configure({
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
});
```

## Storage

### upload

Is a copy of the upload field of Options, providers to other extensions.

```typescript
editor.storage.uploader.upload(FileList)
```

## Paste and Drop

If an extension needs to support paste and drop operations, you can define the uploader field in storage, and the Uploader extension will read the configuration for file uploads during paste and drop operations.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/uploader/index.ts#L11-L14)
export const Image = TImage.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      uploader: {
        match: (_editor, data) => data.type.startsWith("image"),
        apply: (editor, data) => editor.chain().setImage({ src: data.url, alt: data.name }).run(),
      },
    };
  },
});
```
