# FloatMenu extension

FloatMenu extension is used to insert different types of content, which can be called up by selection. Other extensions can place menu configuration on storage to activate float menu support.

## Options

### items

Controls which items need to be displayed in the float menu, and the order in which the float menu is displayed is the same as defined in the items. You can use '|' to split items in different groups.

```typescript
FloatMenu.configure({
  items: [
    "bold",
    "italic",
    "strike",
    "underline",
    "|",
    "code",
    "highlight",
    "link",
    "|",
    "superscript",
    "subscript",
  ],
});
```

## Configuration

If you want to configure the float menu for the new extension, you need to add some configuration in storage.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/float-menu/menu.ts#L5-L15)
export const Bold = TBold.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      floatMenu: {
        items: [
          {
            id: this.name,
            name: this.options.dictionary.name,
            view: icon("bold"),
            shortcut: "Mod-B",
            active: ({ editor }) => editor.isActive(this.name),
            action: ({ editor }) => editor.chain().toggleBold().focus().run(),
          },
        ],
      },
    } satisfies FloatMenuItemStorage;
  },
});
```

If you need to configure not to enable the float menu when the cursor is over the content of a particular extension, you can add the following configuration to storage.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/float-menu/menu.ts#L5-L15)
export const Bold = TBold.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      floatMenu: {
        hide: true,
      },
    } satisfies FloatMenuItemStorage;
  },
});
```
