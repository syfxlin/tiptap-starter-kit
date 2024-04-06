import { Editor } from "@tiptap/core";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Text } from "./nodes/text";
import { Bold } from "./marks/bold";
import { Markdown } from "./extensions/markdown";
import { Document } from "./nodes/document";
import { Paragraph } from "./nodes/paragraph";
import { Clipboard } from "./extensions/clipboard";
import { Code } from "./marks/code";
import { Highlight } from "./marks/highlight";
import { Italic } from "./marks/italic";
import { Link } from "./marks/link";
import "plyr/dist/plyr.css";
import "katex/dist/katex.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import "./styles.less";
import { Strike } from "./marks/strike";
import { Underline } from "./marks/underline";
import { Subscript } from "./marks/sub";
import { Superscript } from "./marks/sup";
import { FloatMenu } from "./extensions/float-menu/menu";
import { BlockMenu } from "./extensions/block-menu/menu";
import { CodeBlock } from "./nodes/code-block";
import { HardBreak } from "./nodes/hard-break";
import { Blockquote } from "./nodes/blockquote";
import { Heading } from "./nodes/heading";
import { HorizontalRule } from "./nodes/horizontal-rule";
import { ListItem } from "./nodes/list-item";
import { BulletList } from "./nodes/bullet-list";
import { OrderedList } from "./nodes/ordered-list";
import { TaskList } from "./nodes/task-list";
import { TaskItem } from "./nodes/task-item";
import { Image } from "./nodes/image";
import { ClickMenu } from "./extensions/click-menu/menu";
import { Uploader } from "./extensions/uploader";
import { Table } from "./nodes/table";
import { TableCell } from "./nodes/table-cell";
import { TableRow } from "./nodes/table-row";
import { TableHeader } from "./nodes/table-header";
import { MathInline } from "./nodes/math-inline";
import { MathBlock } from "./nodes/math-block";
import { Video } from "./nodes/video";
import { Audio } from "./nodes/audio";
import { Emoji } from "./nodes/emoji";
import { Mermaid } from "./nodes/mermaid";

const editor = new Editor({
  element: document.querySelector("#editor")!,
  extensions: [
    Document,
    Paragraph,
    Markdown,
    Clipboard,
    Text,
    Bold,
    Code,
    Highlight,
    Underline,
    Italic,
    Link,
    Strike,
    Subscript,
    Superscript,
    FloatMenu,
    BlockMenu,
    CodeBlock,
    HardBreak,
    Blockquote,
    Heading,
    HorizontalRule,
    ListItem,
    TaskItem,
    BulletList,
    OrderedList,
    TaskList,
    Image,
    Gapcursor,
    Dropcursor.configure({
      color: "var(--tiptap-color-primary)",
      width: 2,
    }),
    ClickMenu,
    Uploader,
    Table,
    TableCell,
    TableRow,
    TableHeader,
    MathInline,
    MathBlock,
    Audio,
    Video,
    Emoji,
    Mermaid,
  ],
  content: `
    aaa <a href="https://ixk.me">Blog</a> <span data-type="mathInline">E = mc^2</span>
    <pre language="javascript"><code>console.log("123");</code></pre>
    aaa <a href="https://ixk.me">Blog</a>
    <img src="https://source.unsplash.com/random" alt="Unsplash">
    <img src="">
    <img src="https://ixk.me/bg.jpg">
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th colspan="3">Description</th>
        </tr>
        <tr>
          <td>Cyndi Lauper</td>
          <td>singer</td>
          <td>songwriter</td>
          <td>actress</td>
        </tr>
      </tbody>
    </table>
  `,
});

// @ts-expect-error
window.editor = editor;
document.querySelector("#editable")?.addEventListener("click", () => {
  const value = document.querySelector("#editable span")!;
  const editable = value.textContent === "true";
  value.textContent = !editable ? "true" : "false";
  editor.setEditable(!editable);
});
