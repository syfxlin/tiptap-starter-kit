# Mermaid extension

Use this extension to render [Mermaid](https://mermaid.js.org/) expression. In addition, the extension can render on the fly when editing expressions and give hints of errors.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Mermaid.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Mermaid.configure({
  dictionary: {
    name: "Mermaid",
    inputHelp: "Help",
    inputGraph: "Enter or paste the mermaid code",
  },
});
```

## Commands

### setMermaid()

Insert a new Mermaid expression.

```typescript
editor.commands.setMermaid("graph TD;\n  A-->B;  A-->C;\n  B-->D;\n  C-->D;");
```

## InputRules

```markdown
:::mermaid
```

## Markdown

```markdown
:::mermaid
graph TD;
  A-->B;  A-->C;
  B-->D;
  C-->D;
:::
```
