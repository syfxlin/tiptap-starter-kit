import { Editor } from "@tiptap/core";
import { Text } from "./nodes/text";
import { Bold } from "./marks/bold";
import { Markdown } from "./extensions/markdown";
import { Document } from "./nodes/document";
import { Paragraph } from "./nodes/paragraph";
import { Clipboard } from "./extensions/clipboard";
import { Code } from "./marks/code";
import { Highlight } from "./marks/highlight";

// @ts-expect-error
window.editor = new Editor({
  element: document.querySelector("#editor")!,
  extensions: [Document, Paragraph, Markdown, Clipboard, Text, Bold, Code, Highlight],
});
