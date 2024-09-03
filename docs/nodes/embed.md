# Embed extension

This extension adds a new embed node to the editor.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Embed.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Embed.configure({
  dictionary: {
    name: "Embed",
    inputEmbed: "Enter or paste embed",
    openEmbed: "Open embed",
    deleteEmbed: "Delete embed",
    alignLeft: "Left alignment",
    alignCenter: "Center alignment",
    alignRight: "Right alignment",
  },
});
```

### inline

Whether to set the embed extension to inline mode.

```typescript
Embed.configure({
  inline: false,
});
```

### items

You can write your own embed rules for different sites, see the [TypeScript definitions](https://github.com/syfxlin/tiptap-starter-kit/blob/master/src/nodes/embed.ts#L20-L24) for details on how to use them.

## Commands

### setEmbed()

Insert a new embed element.

```typescript
editor.commands.setEmbed({
  src: "https://example.com",
  align: "center",
  width: "100px",
  height: "100px"
});
```

## InputRules

```markdown
:embed{https://example.com}
```

## Markdown

```markdown
:embed{https://example.com}
```
