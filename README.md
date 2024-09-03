# Tiptap StarterKit

@syfxlin/tiptap-starter-kit is a collection of unofficial [Tiptap](https://tiptap.dev) extensions. Support for Markdown, Float Menu, Slash Menu and more.

## Features

- Out of the box.
- Better Markdown support, based on [remark](https://github.com/remarkjs/remark).
- Slash menu for Node insertion, with search filter support.
- Float menu for Mark insertion, with status display support.
- Click menu(a.k.a Drag & Drop button) for support dragging the selected content to the specified position.
- Supports copy and paste Markdown or upload files on paste.
- More content block support, such as emoji, mermaid, formulas, etc.

## Theme

[Theme configuration](./docs/styles/theme.md)

## Included extensions

> Some of the extensions are inherited from the official Tiptap extensions, and the changes are minor,
> so the documentation is not provided for the time being, will be added later.

### Marks

- [Subscript](https://tiptap.dev/docs/editor/extensions/marks/subscript)
- [Superscript](https://tiptap.dev/docs/editor/extensions/marks/superscript)
- [Bold](https://tiptap.dev/docs/editor/extensions/marks/bold)
- [Code](https://tiptap.dev/docs/editor/extensions/marks/code)
- [Link](https://tiptap.dev/docs/editor/extensions/marks/link)
- [Italic](https://tiptap.dev/docs/editor/extensions/marks/italic)
- [Strike](https://tiptap.dev/docs/editor/extensions/marks/strike)
- [Highlight](https://tiptap.dev/docs/editor/extensions/marks/highlight)
- [Underline](https://tiptap.dev/docs/editor/extensions/marks/underline)

### Nodes

- [Text](https://tiptap.dev/docs/editor/extensions/nodes/text)
- [Document](https://tiptap.dev/docs/editor/extensions/nodes/document)
- [Heading](https://tiptap.dev/docs/editor/extensions/nodes/heading)
- [Paragraph](https://tiptap.dev/docs/editor/extensions/nodes/paragraph)
- [Blockquote](https://tiptap.dev/docs/editor/extensions/nodes/blockquote)
- [HardBreak](https://tiptap.dev/docs/editor/extensions/nodes/hard-break)
- [CodeBlock](https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight)
- [HorizontalRule](https://tiptap.dev/docs/editor/extensions/nodes/horizontal-rule)
- [BulletList](https://tiptap.dev/docs/editor/extensions/nodes/bullet-list)
- [OrderedList](https://tiptap.dev/docs/editor/extensions/nodes/ordered-list)
- [ListItem](https://tiptap.dev/docs/editor/extensions/nodes/list-item)
- [TaskList](https://tiptap.dev/docs/editor/extensions/nodes/task-list)
- [TaskItem](https://tiptap.dev/docs/editor/extensions/nodes/task-item)
- [Details](./docs/nodes/details.md)
- [DetailsContent](./docs/nodes/details.md)
- [DetailsSummary](./docs/nodes/details.md)
- [Table](https://tiptap.dev/docs/editor/extensions/nodes/table)
- [TableRow](https://tiptap.dev/docs/editor/extensions/nodes/table-row)
- [TableCell](https://tiptap.dev/docs/editor/extensions/nodes/table-cell)
- [TableHeader](https://tiptap.dev/docs/editor/extensions/nodes/table-header)
- [Emoji](./docs/nodes/emoji.md)
- [Embed](./docs/nodes/embed.md)
- [Image](./docs/nodes/image.md)
- [Audio](./docs/nodes/audio.md)
- [Video](./docs/nodes/video.md)
- [Mermaid](./docs/nodes/mermaid.md)
- [Plantuml](./docs/nodes/plantuml.md)
- [MathBlock](./docs/nodes/math-block.md)
- [MathInline](./docs/nodes/math-inline.md)

### Extensions

- [Uploader](./docs/extensions/uploader.md)
- [Markdown](./docs/extensions/markdown.md)
- [Clipboard](./docs/extensions/clipboard.md)
- [BlockMenu](./docs/extensions/block-menu.md)
- [FloatMenu](./docs/extensions/float-menu.md)
- [ClickMenu](./docs/extensions/click-menu.md)
- [History](https://tiptap.dev/docs/editor/extensions/functionality/undo-redo)
- [Gapcursor](https://tiptap.dev/docs/editor/extensions/functionality/gapcursor)
- [Dropcursor](https://tiptap.dev/docs/editor/extensions/functionality/dropcursor)

## Installation

```shell
pnpm i @syfxlin/tiptap-starter-kit @tiptap/core @tiptap/pm
# or
npm i @syfxlin/tiptap-starter-kit @tiptap/core @tiptap/pm
# or
yarn add @syfxlin/tiptap-starter-kit @tiptap/core @tiptap/pm
```

## Usage

```typescript
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@syfxlin/tiptap-starter-kit";

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // disable
      emoji: false,
      // configure
      heading: {
        levels: [1, 2],
      },
    }),
  ],
});
```

## Thanks

- [Milkdown](https://github.com/Milkdown/milkdown)
- [Outline](https://github.com/outline/outline)
- [Notion](https://www.notion.so)
- and more...

## Maintainer

**@syfxlin/tiptap-starter-kit** is written and maintained with the help of [Otstar Lin](https://github.com/syfxlin) and the following [contributors](https://github.com/syfxlin/tiptap-starter-kit/graphs/contributors).

## License

Released under the [MIT](https://opensource.org/licenses/MIT) License.
