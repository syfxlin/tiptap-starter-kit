import { Editor } from "@tiptap/core";
import { Text } from "./nodes/text";
import { Bold } from "./marks/bold";
import { Markdown } from "./markdown/markdown";
import { Document } from "./nodes/document";
import { Paragraph } from "./nodes/paragraph";

// @ts-expect-error
window.editor = new Editor({
  element: document.querySelector("#editor")!,
  extensions: [Document, Paragraph, Markdown, Text, Bold],
});
