# Tiptap StarterKit

> [Tiptap](https://tiptap.dev/) 编辑器的非官方套件，包含了常见的扩展集合，以及斜杠菜单，浮动菜单，Markdown 解析、序列化等功能。

![Author](https://img.shields.io/badge/Author-Otstar%20Lin-blue.svg?style=flat-square) ![License](https://img.shields.io/github/license/syfxlin/tiptap-starter-kit.svg?style=flat-square)

## 安装 Installation

🚧 WIP，目前还处于开发中，后续会发布到 npm 上。

## 包含的扩展 Included extensions

### Extensions

- BlockMenu\*：块菜单，也称为斜杠菜单，通过 '/' 字符开启菜单，用于添加 nodes。
- FloatMenu\*：浮动菜单，选中文本开启菜单，用于将 marks 应用到文本。
- Clipboard\*：剪贴板扩展，用于解析粘贴的 Markdown 内容，同时在复制时将内容序列化为 Markdown。
- Markdown\*：Markdown 扩展，提供 Markdown 解析器和序列化器，使用 [remark](https://github.com/remarkjs/remark) 处理
  Markdown 语法。
- DropCursor
- GapCursor
- History

### Nodes

- Emoji\*：表情扩展，将 Gemoji 解析为对应 Unicode 字符，同时提供了搜索、选择表情的功能，使用 '::' 打开。
- MathInline\*：行内公式，提供渲染 [Katex](https://katex.org/) 公式的功能。
- MathBlock\*：公式块，提供渲染 [Katex](https://katex.org/) 公式的功能。
- Diagram\*：图表块，提供渲染 [Mermaid](https://mermaid-js.github.io/mermaid/#/) 图标的功能。
- Audio\*：音频块。
- Video\*：视频块。
- Details\*：折叠内容块。
- Embed\*：嵌入块，提供嵌入网页的功能。
- Document
- Paragraph
- Text
- Blockquote
- BulletList
- ListItem
- CodeBlock：添加选择语言的功能
- HardBreak
- Heading
- HorizontalRule
- Image：添加了浮动的修改框
- OrderedList
- Table：添加了浮动的操作菜单
- TableCell
- TableHeader
- TableRow
- TaskList
- TaskItem

### Marks

- Bold
- Code
- Highlight
- Italic
- Link：添加了浮动的修改框
- Strike

## 展示 Preview

![BlockMenu](https://user-images.githubusercontent.com/28844480/140959036-376e79b4-df5a-46b3-811e-17ea149e4845.png)

![FloatMenu](https://user-images.githubusercontent.com/28844480/140959231-f2772aca-d28b-431e-9a12-3a97e6b119ec.png)

![Emoji](https://user-images.githubusercontent.com/28844480/140959636-e5156fdf-794a-460c-b260-d6150f74cd5d.png)

![MathInline](https://user-images.githubusercontent.com/28844480/140959757-8f3f3792-1c51-458f-8955-ec9847cb0564.png)

![MathBlock](https://user-images.githubusercontent.com/28844480/140959920-80f8706e-7831-4c59-ac70-fdc756da2899.png)

![Diagram](https://user-images.githubusercontent.com/28844480/140960707-c7d29985-77c5-41f8-95f5-ac28be442d8c.png)

![Details](https://user-images.githubusercontent.com/28844480/140960872-fe544fe9-03e8-4693-90fe-808b38a905f7.png)

![Image](https://user-images.githubusercontent.com/28844480/140961033-8dce1563-77eb-442a-82e7-4b813be39b4a.png)

![CodeBlock](https://user-images.githubusercontent.com/28844480/140961155-c47e731f-c725-43e7-b047-6cb4fe4f7600.png)

![Table](https://user-images.githubusercontent.com/28844480/140961705-6e13af92-6b88-4f3c-99de-3fa76311e079.png)

![Link](https://user-images.githubusercontent.com/28844480/140959457-20939e99-8821-4f5f-b5fc-f976a2bd7950.png)

## 维护者 Maintainer

Tiptap StarterKit 由 [Otstar Lin](https://ixk.me/)
和下列 [贡献者](https://github.com/syfxlin/tiptap-starter-kit/graphs/contributors) 的帮助下撰写和维护。

> Otstar Lin - [Personal Website](https://ixk.me/) · [Blog](https://blog.ixk.me/) · [Github](https://github.com/syfxlin)

## 许可证 License

![License](https://img.shields.io/github/license/syfxlin/tiptap-starter-kit.svg?style=flat-square)

根据 Apache License 2.0 许可证开源。
