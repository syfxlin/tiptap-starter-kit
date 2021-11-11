import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { editorCss, StarterKit } from "@syfxlin/tiptap-starter-kit";
import { css, injectGlobal } from "@emotion/css";

injectGlobal`
  :root {
    --tiptap-color-text: #000;
    --tiptap-color-text-secondly: #adb5bd;
    --tiptap-color-background: #fff;
    --tiptap-color-background-hover: #e9ecef;
    --tiptap-color-background-secondly: #f8f9fa;
    --tiptap-color-border: #ced4da;
    --tiptap-color-reverse-text: #fff;
    --tiptap-color-reverse-text-secondly: #f8f9fa;
    --tiptap-color-reverse-background: #25262b;
    --tiptap-color-reverse-bakcground-secondly: #5c5f66;
    --tiptap-color-primary: #1c7ed6;
    --tiptap-color-selected: #8cf;
    --tiptap-color-code: #c92a2a;
    --tiptap-color-mark: #ffec99;
    --tiptap-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --tiptap-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
    --tiptap-font-weight: 400;
    --tiptap-font-size: 1em;
    --tiptap-line-height: 1.7;
  }
`;

const content = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Tiptap StarterKit" }],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://tiptap.dev/", target: "_blank" },
                },
              ],
              text: "Tiptap",
            },
            {
              type: "text",
              text: " 编辑器的非官方套件，包含了常见的扩展集合，以及斜杠菜单，浮动菜单，Markdown 解析、序列化等功能。",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "安装 Installation" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "🚧 WIP，目前还处于开发中，后续会发布到 npm 上。",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "包含的扩展 Included extensions" }],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Extensions" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "BlockMenu*：块菜单，也称为斜杠菜单，通过 '/' 字符开启菜单，用于添加 nodes。",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "FloatMenu*：浮动菜单，选中文本开启菜单，用于将 marks 应用到文本。",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Clipboard*：剪贴板扩展，用于解析粘贴的 Markdown 内容，同时在复制时将内容序列化为 Markdown。",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Markdown*：Markdown 扩展，提供 Markdown 解析器和序列化器，使用 ",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/remarkjs/remark",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "remark",
                },
                { type: "text", text: " 处理 Markdown 语法。" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "DropCursor" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "GapCursor" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "History" }] }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Nodes" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Emoji*：表情扩展，将 Gemoji 解析为对应 Unicode 字符，同时提供了搜索、选择表情的功能，使用 '::' 打开。",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "MathInline*：行内公式，提供渲染 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: { href: "https://katex.org/", target: "_blank" },
                    },
                  ],
                  text: "Katex",
                },
                { type: "text", text: " 公式的功能。" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "MathBlock*：公式块，提供渲染 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: { href: "https://katex.org/", target: "_blank" },
                    },
                  ],
                  text: "Katex",
                },
                { type: "text", text: " 公式的功能。" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Diagram*：图表块，提供渲染 " },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://mermaid-js.github.io/mermaid/#/",
                        target: "_blank",
                      },
                    },
                  ],
                  text: "Mermaid",
                },
                { type: "text", text: " 图标的功能。" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Audio*：音频块。" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Video*：视频块。" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Details*：折叠内容块。" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Embed*：嵌入块，提供嵌入网页的功能。" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Document" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Paragraph" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Text" }] }],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Blockquote" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "BulletList" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "ListItem" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "CodeBlock：添加选择语言的功能" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "HardBreak" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Heading" }] }],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "HorizontalRule" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Image：添加了浮动的修改框" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "OrderedList" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Table：添加了浮动的操作菜单" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TableCell" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TableHeader" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TableRow" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TaskList" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TaskItem" }],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Marks" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Bold" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Code" }] }],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Highlight" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Italic" }] }],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Link：添加了浮动的修改框" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Strike" }] }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Heading 1" }],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Heading 2" }],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Heading 3" }],
    },
    {
      type: "heading",
      attrs: { level: 4 },
      content: [{ type: "text", text: "Heading 4" }],
    },
    {
      type: "heading",
      attrs: { level: 5 },
      content: [{ type: "text", text: "Heading 5" }],
    },
    {
      type: "heading",
      attrs: { level: 6 },
      content: [{ type: "text", text: "Heading 6" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: "# heading 1\n## heading 2\n### heading 3\n#### heading 4\n##### heading 5\n###### heading 6",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "bold" },
        {
          type: "text",
          text: " ",
        },
        { type: "text", marks: [{ type: "code" }], text: "code" },
        { type: "text", text: " " },
        {
          type: "text",
          marks: [{ type: "italic" }],
          text: "italic",
        },
        { type: "text", text: " " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://github.com/syfxlin/tiptap-starter-kit",
                target: "_blank",
              },
            },
          ],
          text: "link",
        },
        { type: "text", text: " " },
        {
          type: "text",
          marks: [{ type: "strike" }],
          text: "strike",
        },
        { type: "text", text: " " },
        { type: "text", marks: [{ type: "highlight" }], text: "highlight" },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: "**bold** `code` *italic* [link](https://github.com/syfxlin/tiptap-starter-kit)",
        },
      ],
    },
    {
      type: "orderedList",
      attrs: { start: 1 },
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 1" }] }],
        },
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "item 2" }] },
            {
              type: "orderedList",
              attrs: { start: 1 },
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "item 3" }],
                    },
                    {
                      type: "orderedList",
                      attrs: { start: 1 },
                      content: [
                        {
                          type: "listItem",
                          content: [
                            {
                              type: "paragraph",
                              content: [{ type: "text", text: "item 4" }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 5" }] }],
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 1" }] }],
        },
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "item 2" }] },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "item 3" }],
                    },
                    {
                      type: "bulletList",
                      content: [
                        {
                          type: "listItem",
                          content: [
                            {
                              type: "paragraph",
                              content: [{ type: "text", text: "item 4" }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 5" }] }],
        },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 1" }] }],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            { type: "paragraph", content: [{ type: "text", text: "item 2" }] },
            {
              type: "taskList",
              content: [
                {
                  type: "taskItem",
                  attrs: { checked: true },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "item 3" }],
                    },
                    {
                      type: "taskList",
                      content: [
                        {
                          type: "taskItem",
                          attrs: { checked: false },
                          content: [
                            {
                              type: "paragraph",
                              content: [{ type: "text", text: "item 4" }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [{ type: "paragraph", content: [{ type: "text", text: "item 5" }] }],
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: "1.  item 1\n2.  item 2\n    1.  item 3\n        1.  item 4\n3.  item 5\n\n*   item 1\n*   item 2\n    *   item 3\n        *   item 4\n*   item 5\n\n*   [ ] item 1\n*   [ ] item 2\n    *   [x] item 3\n        *   [ ] item 4\n*   [ ] item 5",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "image",
          attrs: { src: "https://ixk.me/bg.jpg", alt: "", title: "" },
        },
        {
          type: "audio",
          attrs: {
            src: "https://lab.ixk.me/assets/media/Summer.mp3",
            title: "",
          },
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "video",
          attrs: {
            src: "https://lab.ixk.me/assets/media/movie.mp4",
            title: "",
          },
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: '![](https://ixk.me/bg.jpg)\n:audio{src="https://lab.ixk.me/assets/media/Summer.mp3"}\n:video{src="https://lab.ixk.me/assets/media/movie.mp4"}',
        },
      ],
    },
    {
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "blockquote" }] }],
    },
    {
      type: "codeBlock",
      attrs: { language: "javascript" },
      content: [{ type: "text", text: 'const this = "coeeBlock";' }],
    },
    {
      type: "paragraph",
      content: [{ type: "mathInline", attrs: { value: "E = mc^2" } }],
    },
    {
      type: "mathBlock",
      content: [{ type: "text", text: "E = mc^2" }],
    },
    { type: "horizontalRule" },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Header" }],
                },
              ],
            },
            {
              type: "tableHeader",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Header" }],
                },
              ],
            },
            {
              type: "tableHeader",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Header" }],
                },
              ],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Content" }],
                },
              ],
            },
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Content" }],
                },
              ],
            },
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: "paragraph" }],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Content" }],
                },
              ],
            },
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: "paragraph" }],
            },
            {
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: "paragraph" }],
            },
          ],
        },
      ],
    },
    {
      type: "details",
      attrs: { open: true, summary: "summary" },
      content: [{ type: "paragraph", content: [{ type: "text", text: "content" }] }],
    },
    {
      type: "diagram",
      content: [{ type: "text", text: "graph TD;\n    A --> B;" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: '> blockquote\n\n```javascript\nconst this = "coeeBlock";\n```\n\n$E = mc^2$\n\n$$\nE = mc^2\n$$\n\n***\n\n| Header  | Header  | Header |\n| ------- | ------- | ------ |\n| Content | Content |        |\n| Content |         |        |\n\n:::details{open="true" summary="summary"}\ncontent\n:::\n\n:::diagram\ngraph TD;\n    A --> B;\n:::',
        },
      ],
    },
    { type: "embed", attrs: { src: "https://ixk.me", title: "My Homepage" } },
    {
      type: "embed",
      attrs: {
        src: "https://gist.github.com/syfxlin/bef0c2f70beee99061f1612968a3e085",
        title: "Weekly development breakdown",
      },
    },
    {
      type: "codeBlock",
      attrs: { language: "markdown" },
      content: [
        {
          type: "text",
          text: ':embed{src="https://ixk.me" title="My Homepage"}\n:embed{src="https://gist.github.com/syfxlin/bef0c2f70beee99061f1612968a3e085" title="Weekly development breakdown"}\n// default support airtable, codepen, codesandbox, draw.io, gist, google docs, office',
        },
      ],
    },
  ],
};

const App: React.FC = () => {
  const [editable, setEditable] = useState(true);
  const editor = useEditor({
    editable: true,
    extensions: [StarterKit],
    content,
  });
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);
  return (
    <div
      className={css`
        width: 80%;
        margin: auto;
      `}
    >
      <h1>Title</h1>
      <div>
        <button onClick={() => setEditable(!editable)}>
          Set Editable: {editable ? "true" : "false"}
        </button>
      </div>
      <EditorContent editor={editor} className={editorCss} />
    </div>
  );
};

export default App;
