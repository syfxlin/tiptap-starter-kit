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

// @ts-expect-error
window.editor = new Editor({
  element: document.querySelector("#editor")!,
  extensions: [Document, Paragraph, Markdown, Clipboard, Text, Bold, Code, Highlight, Italic, Link, Strike],
  content: `aaa <a href="https://ixk.me">Blog</a>`,
});
