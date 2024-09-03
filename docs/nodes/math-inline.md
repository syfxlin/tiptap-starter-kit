# MathInline extension

Use this extension to render inline mathematics expressions. Mathematics expressions are rendered using [KaTeX](https://katex.org/). In addition, the extension can render on the fly when editing expressions and give hints of errors.

## Additional Setup

Import of KaTeX styling.

```typescript
import "katex/dist/katex.min.css";
```

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
MathInline.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
MathInline.configure({
  dictionary: {
    name: "Math Inline",
    emptyMath: "Add a Tex equation",
    inputMath: "Enter or paste the equation",
    inputHelp: "Help",
  },
});
```

## Commands

### setMathInline()

Insert a new inline mathematics expression.

```typescript
editor.commands.setMathInline("E = mc^2");
```

## Markdown

[GitHub Writing mathematical expressions](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)
