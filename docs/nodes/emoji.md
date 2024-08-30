# Emoji extension

The Emoji extension renders github emojis as an inline node.

Type `:` to open the autocomplete.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Emoji.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Emoji.configure({
  dictionary: {
    name: "Emoji",
    queryEmpty: "No results found",
  },
});
```

## Commands

### setEmoji()

Insert a new emoji element.

```typescript
editor.commands.setEmoji("lemon");
```

## InputRules

```markdown
:lemon:
```

## Markdown

```markdown
:lemon:
```
