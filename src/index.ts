import { Editor } from "@tiptap/core";
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
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import "./styles.css";
import { Strike } from "./marks/strike";
import { Underline } from "./marks/underline";
import { Subscript } from "./marks/sub";
import { Superscript } from "./marks/sup";
import { FloatMenu } from "./extensions/float-menu/menu";
import { BlockMenu } from "./extensions/block-menu/menu";
import { CodeBlock } from "./nodes/code-block";

// @ts-expect-error
window.editor = new Editor({
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
  ],
  content: `aaa <a href="https://ixk.me">Blog</a> <pre language="javascript"><code>console.log("123");</code></pre> aaa`,
});
