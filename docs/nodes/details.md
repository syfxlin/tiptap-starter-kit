# Details extension

Use this extension to render Details element. This is great to show and hide content.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Details.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Details.configure({
  dictionary: {
    name: "Details",
  },
});
```

## Commands

### setDetails()

Wrap content in a details node.

```typescript
editor.commands.setDetails();
```

### unsetDetails()

Unwrap a details node.

```typescript
editor.commands.unsetDetails();
```

### toggleDetails()

Wrap content in a details node or unwrap a details node.

```typescript
editor.commands.toggleDetails();
```

## InputRules

```markdown
:::details
```

## Markdown

```markdown
::::details{open="true"}
:::detailsSummary
details summary 

**bold**
:::

:::detailsContent
details content

**bold**
:::
::::
```
