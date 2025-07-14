# BlockMenu extension

BlockMenu extension (a.k.a SlashMenu) is used to insert different types of content, which can be called up by typing '/'. Other extensions can place menu configuration on storage to activate block menu support.

## Options

### items

Controls which items need to be displayed in the block menu, and the order in which the block menu is displayed is the same as defined in the items. You can use '|' to split items in different groups.

```typescript
BlockMenu.configure({
  items: [
    "heading1",
    "heading2",
    "heading3",
    "|",
    "orderedList",
    "bulletList",
    "taskList",
    "|",
    "image",
    "|",
    "blockquote",
    "codeBlock",
    "mathBlock",
    "mermaid",
    "plantuml",
    "|",
    "horizontalRule",
    "table",
    "details",
    "embed",
  ],
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
BlockMenu.configure({
  dictionary: {
    lineEmpty: "Enter '/' to insert block...",
    lineSlash: "Continue typing to filter...",
    queryEmpty: "No results found",
  },
});
```

## Configuration

If you want to configure the block menu for the new extension, you need to add some configuration in storage.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/block-menu/menu.ts#L7-L14)
export const Blockquote = IBlockquote.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      blockMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            icon: icon("blockquote"),
            shortcut: "Mod-Shift-B",
            keywords: "blockquote,bq,yyk",
            action: editor => editor.chain().toggleBlockquote().focus().run(),
          },
        ],
      },
    } satisfies BlockMenuItemStorage;
  },
});
```

If you need to configure not to enable the block menu when the cursor is over the content of a particular extension, you can add the following configuration to storage.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/block-menu/menu.ts#L7-L14)
export const Blockquote = IBlockquote.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      blockMenu: {
        hide: true,
      },
    } satisfies BlockMenuItemStorage;
  },
});
```
