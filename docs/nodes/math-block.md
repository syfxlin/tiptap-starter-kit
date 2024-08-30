# MathBlock extension

Use this extension to render block mathematics expressions. Mathematics expressions are rendered using [KaTeX](https://katex.org/). In addition, the extension can render on the fly when editing expressions and give hints of errors.

## Additional Setup

Import of KaTeX styling.

```typescript
import "katex/dist/katex.min.css";
```

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
MathBlock.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
MathBlock.configure({
  dictionary: {
    name: "Math Block",
    inputMath: "Enter or paste the equation",
    inputHelp: "Help",
  },
});
```

## Commands

### setMathBlock()

Insert a new block mathematics expression.

```typescript
editor.commands.setMathBlock("E = mc^2");
```

## Markdown

[GitHub Writing mathematical expressions](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)
