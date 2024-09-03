# Markdown extension

Markdown extension is used for parsing or serializing the content of a document. Other extensions can place markdown configuration on storage to activate parsing or serializing support.

Markdown parser and serializer are using the [remark](https://github.com/remarkjs/remark).

## Storage

### get

Converts the content in the current editor to Markdown output.

```typescript
editor.storage.markdown.get(); // => Markdown
```

### set

Replace the content of the current editor with the entered Markdown content.

```typescript
editor.storage.markdown.set("`code` **bold**"); // => Prevent publish update events，it is useful to avoid cyclic updates, and is useful when you need to synchronize Markdown in both directions
editor.storage.markdown.set("`code` **bold**", true);
```

### parse

Convert Markdown to ProseMirror Node.

```typescript
editor.storage.markdown.parse("`code` **bold**");
```

### serialize

Convert ProseMirror Node to Markdown.

```typescript
editor.storage.markdown.serialize(this.edito.state.doc)
```

### processor

Get the [remark](https://github.com/remarkjs/remark) instance that has been processed with all extensions.

```typescript
editor.storage.markdown.processor.parse("`code` **bold**");
```

## Parse and Serialize

If an extension needs to support parse and serialize markdown operations, you can define the markdown field in storage, and the Markdown extension will read the configuration for parse and serialize markdown operations.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/markdown/types/index.ts#L18-L58)
export const Bold = TBold.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      markdown: {
        parser: {
          match: node => node.type === "strong",
          apply: (state, node, type) => {
            state.openMark(type);
            state.next(node.children);
            state.closeMark(type);
          },
        },
        serializer: {
          match: mark => mark.type.name === this.name,
          apply: (state, mark) => {
            state.withMark(mark, {
              type: "strong",
            });
          },
        },
      },
    };
  },
});
```
