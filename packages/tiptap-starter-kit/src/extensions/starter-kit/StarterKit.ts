import { AnyExtension, Extension } from "@tiptap/core";
import { BlockMenu, BlockMenuOptions } from "../block-menu/BlockMenu";
import { FloatMenu, FloatMenuOptions } from "../float-menu/FloatMenu";
import { Clipboard } from "../clipboard/Clipboard";
import { Markdown } from "../markdown/Markdown";
import { Dropcursor, DropcursorOptions } from "@tiptap/extension-dropcursor";
import { HistoryOptions } from "@tiptap/extension-history/src/history";
import { History } from "@tiptap/extension-history";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { BoldOptions } from "@tiptap/extension-bold";
import { CodeOptions } from "@tiptap/extension-code";
import { HighlightOptions } from "@tiptap/extension-highlight";
import { ItalicOptions } from "@tiptap/extension-italic";
import { StrikeOptions } from "@tiptap/extension-strike";
import { ParagraphOptions } from "@tiptap/extension-paragraph/src/paragraph";
import { BlockquoteOptions } from "@tiptap/extension-blockquote";
import { BulletListOptions } from "@tiptap/extension-bullet-list";
import { ListItemOptions } from "@tiptap/extension-list-item";
import { CodeBlockLowlightOptions } from "@tiptap/extension-code-block-lowlight";
import { HardBreakOptions } from "@tiptap/extension-hard-break";
import { HeadingOptions } from "@tiptap/extension-heading";
import { HorizontalRuleOptions } from "@tiptap/extension-horizontal-rule";
import { OrderedListOptions } from "@tiptap/extension-ordered-list";
import { TableOptions } from "@tiptap/extension-table";
import { TableRowOptions } from "@tiptap/extension-table-row";
import { TaskListOptions } from "@tiptap/extension-task-list";
import { TaskItemOptions } from "@tiptap/extension-task-item";
import { Bold } from "../../marks/Bold";
import { Code } from "../../marks/Code";
import { Highlight } from "../../marks/Highlight";
import { Italic } from "../../marks/Italic";
import { Link, LinkOptions } from "../../marks/Link";
import { Strike } from "../../marks/Strike";
import { Document } from "../../nodes/Document";
import { Paragraph } from "../../nodes/Paragraph";
import { Text } from "../../nodes/Text";
import { Blockquote } from "../../nodes/Blockquote";
import { BulletList } from "../../nodes/BulletList";
import { ListItem } from "../../nodes/ListItem";
import { CodeBlock } from "../../nodes/CodeBlock";
import { HardBreak } from "../../nodes/HardBreak";
import { Heading } from "../../nodes/Heading";
import { HorizontalRule } from "../../nodes/HorizontalRule";
import { Image, ImageOptions } from "../../nodes/Image";
import { OrderedList } from "../../nodes/OrderedList";
import { Table } from "../../nodes/Table";
import { TableCell, TableCellOptions } from "../../nodes/TableCell";
import { TableHeader, TableHeaderOptions } from "../../nodes/TableHeader";
import { TableRow } from "../../nodes/TableRow";
import { TaskList } from "../../nodes/TaskList";
import { TaskItem } from "../../nodes/TaskItem";
import { MathInline, MathInlineOptions } from "../../nodes/MathInline";
import { MathBlock, MathBlockOptions } from "../../nodes/MathBlock";
import { Diagram, DiagramOptions } from "../../nodes/Diagram";
import { Audio, AudioOptions } from "../../nodes/Audio";
import { Video, VideoOptions } from "../../nodes/Video";
import { Details, DetailsOptions } from "../../nodes/Details";
import { Embed, EmbedOptions } from "../../nodes/Embed";
import { Emoji, EmojiOptions } from "../../nodes/Emoji";
import { Uploader, UploaderOptions } from "../uploader/Uploader";

export type StarterKitOptions = {
  // extensions
  dropCursor?: Partial<DropcursorOptions> | false;
  gapCursor?: false;
  history?: Partial<HistoryOptions> | false;
  // marks
  bold?: Partial<BoldOptions> | false;
  code?: Partial<CodeOptions> | false;
  highlight?: Partial<HighlightOptions> | false;
  italic?: Partial<ItalicOptions> | false;
  link?: Partial<LinkOptions> | false;
  strike?: Partial<StrikeOptions> | false;
  // nodes
  document?: false;
  paragraph?: Partial<ParagraphOptions> | false;
  text?: false;
  blockquote?: Partial<BlockquoteOptions> | false;
  bulletList?: Partial<BulletListOptions> | false;
  listItem?: Partial<ListItemOptions> | false;
  codeBlock?: Partial<CodeBlockLowlightOptions> | false;
  hardBreak?: Partial<HardBreakOptions> | false;
  heading?: Partial<HeadingOptions> | false;
  horizontalRule?: Partial<HorizontalRuleOptions> | false;
  image?: Partial<ImageOptions> | false;
  orderedList?: Partial<OrderedListOptions> | false;
  table?: Partial<TableOptions> | false;
  tableCell?: Partial<TableCellOptions> | false;
  tableHeader?: Partial<TableHeaderOptions> | false;
  tableRow?: Partial<TableRowOptions> | false;
  taskList?: Partial<TaskListOptions> | false;
  taskItem?: Partial<TaskItemOptions> | false;
  // own
  blockMenu?: Partial<BlockMenuOptions> | false;
  clipboard?: false;
  floatMenu?: Partial<FloatMenuOptions> | false;
  markdown?: false;
  uploader?: Partial<UploaderOptions> | false;
  emoji?: Partial<EmojiOptions> | false;
  mathInline?: Partial<MathInlineOptions> | false;
  mathBlock?: Partial<MathBlockOptions> | false;
  diagram?: Partial<DiagramOptions> | false;
  audio?: Partial<AudioOptions> | false;
  video?: Partial<VideoOptions> | false;
  details?: Partial<DetailsOptions> | false;
  embed?: Partial<EmbedOptions> | false;
};

export const StarterKit = Extension.create<StarterKitOptions>({
  name: "starterKit",
  addExtensions() {
    const extensions: AnyExtension[] = [];

    // extensions
    if (this.options.dropCursor !== false) {
      extensions.push(Dropcursor.configure(this.options?.dropCursor));
    }
    if (this.options.gapCursor !== false) {
      extensions.push(Gapcursor);
    }
    if (this.options.history !== false) {
      extensions.push(History.configure(this.options?.history));
    }

    // marks
    if (this.options.bold !== false) {
      extensions.push(Bold.configure(this.options?.bold));
    }
    if (this.options.code !== false) {
      extensions.push(Code.configure(this.options?.code));
    }
    if (this.options.highlight !== false) {
      extensions.push(Highlight.configure(this.options?.highlight));
    }
    if (this.options.italic !== false) {
      extensions.push(Italic.configure(this.options?.italic));
    }
    if (this.options.link !== false) {
      extensions.push(Link.configure(this.options?.link));
    }
    if (this.options.strike !== false) {
      extensions.push(Strike.configure(this.options?.strike));
    }

    // nodes
    if (this.options.document !== false) {
      extensions.push(Document);
    }
    if (this.options.paragraph !== false) {
      extensions.push(Paragraph.configure(this.options?.paragraph));
    }
    if (this.options.text !== false) {
      extensions.push(Text);
    }
    if (this.options.blockquote !== false) {
      extensions.push(Blockquote.configure(this.options?.blockquote));
    }
    if (this.options.bulletList !== false) {
      extensions.push(BulletList.configure(this.options?.bulletList));
    }
    if (this.options.listItem !== false) {
      extensions.push(ListItem.configure(this.options?.listItem));
    }
    if (this.options.codeBlock !== false) {
      extensions.push(CodeBlock.configure(this.options?.codeBlock));
    }
    if (this.options.hardBreak !== false) {
      extensions.push(HardBreak.configure(this.options?.hardBreak));
    }
    if (this.options.heading !== false) {
      extensions.push(Heading.configure(this.options?.heading));
    }
    if (this.options.horizontalRule !== false) {
      extensions.push(HorizontalRule.configure(this.options?.horizontalRule));
    }
    if (this.options.image !== false) {
      extensions.push(Image.configure(this.options?.image));
    }
    if (this.options.orderedList !== false) {
      extensions.push(OrderedList.configure(this.options?.orderedList));
    }
    if (this.options.table !== false) {
      extensions.push(Table.configure(this.options?.table));
    }
    if (this.options.tableCell !== false) {
      extensions.push(TableCell.configure(this.options?.tableCell));
    }
    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options?.tableHeader));
    }
    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options?.tableRow));
    }
    if (this.options.taskList !== false) {
      extensions.push(TaskList.configure(this.options?.taskList));
    }
    if (this.options.taskItem !== false) {
      extensions.push(TaskItem.configure(this.options?.taskItem));
    }

    // own
    if (this.options.blockMenu !== false) {
      extensions.push(BlockMenu.configure(this.options?.blockMenu));
    }
    if (this.options.clipboard !== false) {
      extensions.push(Clipboard);
    }
    if (this.options.floatMenu !== false) {
      extensions.push(FloatMenu.configure(this.options?.floatMenu));
    }
    if (this.options.markdown !== false) {
      extensions.push(Markdown);
    }
    if (this.options.uploader !== false) {
      extensions.push(Uploader.configure(this.options?.uploader));
    }
    if (this.options.emoji !== false) {
      extensions.push(Emoji.configure(this.options?.emoji));
    }
    if (this.options.mathInline !== false) {
      extensions.push(MathInline.configure(this.options?.mathInline));
    }
    if (this.options.mathBlock !== false) {
      extensions.push(MathBlock.configure(this.options?.mathBlock));
    }
    if (this.options.diagram !== false) {
      extensions.push(Diagram.configure(this.options?.diagram));
    }
    if (this.options.audio !== false) {
      extensions.push(Audio.configure(this.options?.audio));
    }
    if (this.options.video !== false) {
      extensions.push(Video.configure(this.options?.video));
    }
    if (this.options.details !== false) {
      extensions.push(Details.configure(this.options?.details));
    }
    if (this.options.embed !== false) {
      extensions.push(Embed.configure(this.options?.embed));
    }

    return extensions;
  },
});
