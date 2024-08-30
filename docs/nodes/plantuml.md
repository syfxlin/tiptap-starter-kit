# PlantUML extension

Use this extension to render [PlantUML](https://plantuml.com/) expression. In addition, the extension can render on the fly when editing expressions and give hints of errors.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Plantuml.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Plantuml.configure({
  dictionary: {
    name: "PlantUML",
    inputHelp: "Help",
    inputGraph: "Enter or paste the plantuml code",
  },
});
```

## Commands

### setPlantuml()

Insert a new PlantUML expression.

```typescript
editor.commands.setPlantuml("@startuml\nBob -> Alice : hello\n@enduml");
```

## InputRules

```markdown
:::plantuml
```

## Markdown

```markdown
:::plantuml
@startuml
Bob -> Alice : hello
@enduml
:::
```
