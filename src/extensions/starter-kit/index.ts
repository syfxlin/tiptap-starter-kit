import { AnyExtension, Extension } from "@tiptap/core";
import { Dropcursor, DropcursorOptions } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { History, HistoryOptions } from "@tiptap/extension-history";
import { Bold, BoldOptions } from "../../marks/bold";
import { Code, CodeOptions } from "../../marks/code";
import { Highlight, HighlightOptions } from "../../marks/highlight";
import { Italic, ItalicOptions } from "../../marks/italic";
import { Link, LinkOptions } from "../../marks/link";
import { Strike, StrikeOptions } from "../../marks/strike";
import { Subscript, SubscriptOptions } from "../../marks/sub";
import { Superscript, SuperscriptOptions } from "../../marks/sup";
import { Underline, UnderlineOptions } from "../../marks/underline";
import { Blockquote, BlockquoteOptions } from "../../nodes/blockquote";
import { BulletList, BulletListOptions } from "../../nodes/bullet-list";
import { CodeBlock, CodeBlockOptions } from "../../nodes/code-block";
import { Details, DetailsOptions } from "../../nodes/details";
import { DetailsContent, DetailsContentOptions } from "../../nodes/details-content";
import { DetailsSummary, DetailsSummaryOptions } from "../../nodes/details-summary";
import { Document } from "../../nodes/document";
import { Embed, EmbedOptions } from "../../nodes/embed";
import { Emoji, EmojiOptions } from "../../nodes/emoji";
import { HardBreak, HardBreakOptions } from "../../nodes/hard-break";
import { Heading, HeadingOptions } from "../../nodes/heading";
import { HorizontalRule, HorizontalRuleOptions } from "../../nodes/horizontal-rule";
import { Image, ImageOptions } from "../../nodes/image";
import { ListItem, ListItemOptions } from "../../nodes/list-item";
import { MathBlock, MathBlockOptions } from "../../nodes/math-block";
import { MathInline, MathInlineOptions } from "../../nodes/math-inline";
import { Mermaid, MermaidOptions } from "../../nodes/mermaid";
import { OrderedList, OrderedListOptions } from "../../nodes/ordered-list";
import { Paragraph, ParagraphOptions } from "../../nodes/paragraph";
import { Plantuml, PlantumlOptions } from "../../nodes/plantuml";
import { Table, TableOptions } from "../../nodes/table";
import { TableCell, TableCellOptions } from "../../nodes/table-cell";
import { TableHeader, TableHeaderOptions } from "../../nodes/table-header";
import { TableRow, TableRowOptions } from "../../nodes/table-row";
import { TaskItem, TaskItemOptions } from "../../nodes/task-item";
import { TaskList, TaskListOptions } from "../../nodes/task-list";
import { Text } from "../../nodes/text";
import { configure } from "../../utils/functions";
import { BlockMenu, BlockMenuOptions } from "../block-menu/menu";
import { ClickMenu, ClickMenuOptions } from "../click-menu/menu";
import { Clipboard, ClipboardOptions } from "../clipboard";
import { FloatMenu, FloatMenuOptions } from "../float-menu/menu";
import { Markdown, MarkdownOptions } from "../markdown";
import { Uploader, UploaderOptions } from "../uploader";

export interface StarterKitOptions {
  // marks
  sub?: Partial<SubscriptOptions> | boolean;
  sup?: Partial<SuperscriptOptions> | boolean;
  bold?: Partial<BoldOptions> | boolean;
  code?: Partial<CodeOptions> | boolean;
  link?: Partial<LinkOptions> | boolean;
  italic?: Partial<ItalicOptions> | boolean;
  strike?: Partial<StrikeOptions> | boolean;
  highlight?: Partial<HighlightOptions> | boolean;
  underline?: Partial<UnderlineOptions> | boolean;
  // nodes
  text?: boolean;
  document?: boolean;
  heading?: Partial<HeadingOptions> | boolean;
  paragraph?: Partial<ParagraphOptions> | boolean;
  blockquote?: Partial<BlockquoteOptions> | boolean;
  hardBreak?: Partial<HardBreakOptions> | boolean;
  codeBlock?: Partial<CodeBlockOptions> | boolean;
  horizontalRule?: Partial<HorizontalRuleOptions> | boolean;
  bulletList?: Partial<BulletListOptions> | boolean;
  orderedList?: Partial<OrderedListOptions> | boolean;
  listItem?: Partial<ListItemOptions> | boolean;
  taskList?: Partial<TaskListOptions> | boolean;
  taskItem?: Partial<TaskItemOptions> | boolean;
  details?: Partial<DetailsOptions> | boolean;
  detailsContent?: Partial<DetailsContentOptions> | boolean;
  detailsSummary?: Partial<DetailsSummaryOptions> | boolean;
  table?: Partial<TableOptions> | boolean;
  tableRow?: Partial<TableRowOptions> | boolean;
  tableCell?: Partial<TableCellOptions> | boolean;
  tableHeader?: Partial<TableHeaderOptions> | boolean;
  emoji?: Partial<EmojiOptions> | boolean;
  embed?: Partial<EmbedOptions> | boolean;
  image?: Partial<ImageOptions> | boolean;
  mermaid?: Partial<MermaidOptions> | boolean;
  plantuml?: Partial<PlantumlOptions> | boolean;
  mathBlock?: Partial<MathBlockOptions> | boolean;
  mathInline?: Partial<MathInlineOptions> | boolean;
  // extensions
  uploader?: Partial<UploaderOptions> | boolean;
  markdown?: Partial<MarkdownOptions> | boolean;
  clipboard?: Partial<ClipboardOptions> | boolean;
  blockMenu?: Partial<BlockMenuOptions> | boolean;
  floatMenu?: Partial<FloatMenuOptions> | boolean;
  clickMenu?: Partial<ClickMenuOptions> | boolean;
  // tiptap
  history?: Partial<HistoryOptions> | boolean;
  gapCursor?: Partial<any> | boolean;
  dropCursor?: Partial<DropcursorOptions> | boolean;
}

export const StarterKit = Extension.create<StarterKitOptions>({
  name: "starterKit",
  addExtensions() {
    const extensions: Array<AnyExtension> = [];

    // marks
    configure(extensions, Subscript, this.options.sub);
    configure(extensions, Superscript, this.options.sup);
    configure(extensions, Bold, this.options.bold);
    configure(extensions, Code, this.options.code);
    configure(extensions, Link, this.options.link);
    configure(extensions, Italic, this.options.italic);
    configure(extensions, Strike, this.options.strike);
    configure(extensions, Highlight, this.options.highlight);
    configure(extensions, Underline, this.options.underline);
    // nodes
    configure(extensions, Text, this.options.text);
    configure(extensions, Document, this.options.document);
    configure(extensions, Heading, this.options.heading);
    configure(extensions, Paragraph, this.options.paragraph);
    configure(extensions, Blockquote, this.options.blockquote);
    configure(extensions, HardBreak, this.options.hardBreak);
    configure(extensions, CodeBlock, this.options.codeBlock);
    configure(extensions, HorizontalRule, this.options.horizontalRule);
    configure(extensions, BulletList, this.options.bulletList);
    configure(extensions, OrderedList, this.options.orderedList);
    configure(extensions, ListItem, this.options.listItem);
    configure(extensions, TaskList, this.options.taskList);
    configure(extensions, TaskItem, this.options.taskItem);
    configure(extensions, Details, this.options.details);
    configure(extensions, DetailsContent, this.options.detailsContent);
    configure(extensions, DetailsSummary, this.options.detailsSummary);
    configure(extensions, Table, this.options.table);
    configure(extensions, TableRow, this.options.tableRow);
    configure(extensions, TableCell, this.options.tableCell);
    configure(extensions, TableHeader, this.options.tableHeader);
    configure(extensions, Emoji, this.options.emoji);
    configure(extensions, Embed, this.options.embed);
    configure(extensions, Image, this.options.image);
    configure(extensions, Mermaid, this.options.mermaid);
    configure(extensions, Plantuml, this.options.plantuml);
    configure(extensions, MathBlock, this.options.mathBlock);
    configure(extensions, MathInline, this.options.mathInline);
    // extensions
    configure(extensions, Uploader, this.options.uploader);
    configure(extensions, Markdown, this.options.markdown);
    configure(extensions, Clipboard, this.options.clipboard);
    configure(extensions, BlockMenu, this.options.blockMenu);
    configure(extensions, FloatMenu, this.options.floatMenu);
    configure(extensions, ClickMenu, this.options.clickMenu);
    // tiptap
    configure(extensions, History, this.options.history);
    configure(extensions, Gapcursor, this.options.gapCursor);
    configure(extensions, Dropcursor, this.options.dropCursor, { color: "var(--tiptap-primary-background)", width: 2 });

    return extensions;
  },
});
