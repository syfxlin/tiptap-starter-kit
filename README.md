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

## Included extensions

### Marks

- Subscript
- Superscript
- Bold
- Code
- Link
- Italic
- Strike
- Highlight
- Underline

### Nodes

- Text
- Document
- Heading
- Paragraph
- Blockquote
- HardBreak
- CodeBlock
- HorizontalRule
- BulletList
- OrderedList
- ListItem
- TaskList
- TaskItem
- Details
- DetailsContent
- DetailsSummary
- Table
- TableRow
- TableCell
- TableHeader
- Emoji
- Embed
- Image
- Audio
- Video
- Mermaid
- Plantuml
- MathBlock
- MathInline

### Extensions

- Uploader
- Markdown
- Clipboard
- BlockMenu
- FloatMenu
- ClickMenu
- History
- Gapcursor
- Dropcursor

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
