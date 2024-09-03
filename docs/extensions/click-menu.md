# ClickMenu extension

ClickMenu extension (a.k.a Drag & Drop button) to select or move content blocks. Other extensions can place menu configuration on storage to activate click menu support.

## Configuration

If you need to configure not to enable the click menu when the cursor is over the content of a particular extension, you can add the following configuration to storage.

```typescript
// [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/extensions/click-menu/menu.ts#L5-L10)
export const Blockquote = IBlockquote.extend({
  addStorage() {
    return {
      ...this.parent?.(),
      clickMenu: {
        hide: true,
      },
    } satisfies ClickMenuItemStorage;
  },
});
```
