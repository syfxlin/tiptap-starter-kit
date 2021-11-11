import { BlockMenuItem } from "./BlockMenu";
import { commandView } from "./utils";
import {
  AudioFile,
  Browser,
  ChartGraph,
  Code,
  DividingLine,
  H1,
  H2,
  H3,
  Inline,
  InsertTable,
  List,
  Pic,
  Quote,
  VideoFile,
} from "@icon-park/svg";

export const defaultBlockMenuItems: BlockMenuItem[] = [
  {
    name: "h1",
    keywords: "heading1,bt1",
    view: commandView({
      name: "标题 1",
      icon: H1({}),
      shortcut: "Ctrl Alt 1",
    }),
    command: (editor) => editor.chain().toggleHeading({ level: 1 }).run(),
    disable: (editor) => !editor.schema.nodes.heading,
  },
  {
    name: "h2",
    keywords: "heading2,bt2",
    view: commandView({
      name: "标题 2",
      icon: H2({}),
      shortcut: "Ctrl Alt 2",
    }),
    command: (editor) => editor.chain().toggleHeading({ level: 2 }).run(),
    disable: (editor) => !editor.schema.nodes.heading,
  },
  {
    name: "h3",
    keywords: "heading3,bt3",
    view: commandView({
      name: "标题 3",
      icon: H3({}),
      shortcut: "Ctrl Alt 3",
    }),
    command: (editor) => editor.chain().toggleHeading({ level: 3 }).run(),
    disable: (editor) => !editor.schema.nodes.heading,
  },
  {
    separator: true,
  },
  {
    name: "ol",
    keywords: "orderedList,yxlb",
    view: commandView({
      name: "有序列表",
      icon: List({}),
      shortcut: "Ctrl Shift 7",
    }),
    command: (editor) => editor.chain().toggleOrderedList().run(),
    disable: (editor) => !editor.schema.nodes.orderedList,
  },
  {
    name: "ul",
    keywords: "bulletList,unorderedList,wxlb",
    view: commandView({
      name: "无序列表",
      icon: List({}),
      shortcut: "Ctrl Shift 8",
    }),
    command: (editor) => editor.chain().toggleBulletList().run(),
    disable: (editor) => !editor.schema.nodes.bulletList,
  },
  {
    name: "task",
    keywords: "taskList,todo,rwlb",
    view: commandView({
      name: "任务列表",
      icon: List({}),
      shortcut: "Ctrl Shift 9",
    }),
    command: (editor) => editor.chain().toggleTaskList().run(),
    disable: (editor) => !editor.schema.nodes.taskList,
  },
  {
    separator: true,
  },
  {
    name: "image",
    keywords: "img,picture,tp,zp,tx",
    view: commandView({
      name: "图片",
      icon: Pic({}),
    }),
    command: (editor) => editor.chain().setImage({ src: "" }).run(),
    disable: (editor) => !editor.schema.nodes.image,
  },
  {
    name: "audio",
    keywords: "yp,yy",
    view: commandView({
      name: "音频",
      icon: AudioFile({}),
    }),
    command: (editor) => editor.chain().setAudio({ src: "" }).run(),
    disable: (editor) => !editor.schema.nodes.audio,
  },
  {
    name: "video",
    keywords: "movie,sp,dy",
    view: commandView({
      name: "视频",
      icon: VideoFile({}),
    }),
    command: (editor) => editor.chain().setVideo({ src: "" }).run(),
    disable: (editor) => !editor.schema.nodes.video,
  },
  {
    separator: true,
  },
  {
    name: "blockquote",
    keywords: "blockquote,yy",
    view: commandView({
      name: "引用",
      icon: Quote({}),
      shortcut: "Ctrl Shift B",
    }),
    command: (editor) => editor.chain().toggleBlockquote().run(),
    disable: (editor) => !editor.schema.nodes.blockquote,
  },
  {
    name: "code",
    keywords: "codeBlock,dmk",
    view: commandView({
      name: "代码块",
      icon: Code({}),
      shortcut: "Ctrl Alt C",
    }),
    command: (editor) =>
      editor.chain().toggleCodeBlock({ language: "javascript" }).run(),
    disable: (editor) => !editor.schema.nodes.codeBlock,
  },
  {
    name: "mathInline",
    keywords: "katex,gs,sxgs",
    view: commandView({
      name: "公式（行内）",
      icon: Inline({}),
    }),
    command: (editor) => editor.chain().setMathInline("E = mc^2").run(),
    disable: (editor) => !editor.schema.nodes.mathInline,
  },
  {
    name: "mathBlock",
    keywords: "katex,gsk,sxgsk",
    view: commandView({
      name: "公式（块）",
      icon: Inline({}),
    }),
    command: (editor) => editor.chain().setMathBlock("E = mc^2").run(),
    disable: (editor) => !editor.schema.nodes.mathBlock,
  },
  {
    name: "hr",
    keywords: "horizontalRule,fgx",
    view: commandView({
      name: "分割线",
      icon: DividingLine({}),
    }),
    command: (editor) => editor.chain().setHorizontalRule().run(),
    disable: (editor) => !editor.schema.nodes.horizontalRule,
  },
  {
    name: "table",
    keywords: "bg",
    view: commandView({
      name: "表格",
      icon: InsertTable({}),
    }),
    command: (editor) =>
      editor
        .chain()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
    disable: (editor) => !editor.schema.nodes.table,
  },
  {
    name: "details",
    keywords: "summary,hide,ms",
    view: commandView({
      name: "描述",
      icon: DividingLine({}),
    }),
    command: (editor) => editor.chain().setDetails({ open: true }).run(),
    disable: (editor) => !editor.schema.nodes.details,
  },
  {
    name: "diagram",
    keywords: "mermaid,t",
    view: commandView({
      name: "图（Mermaid）",
      icon: ChartGraph({}),
    }),
    command: (editor) =>
      editor.chain().setDiagram("graph TD;\n    A --> B;").run(),
    disable: (editor) => !editor.schema.nodes.diagram,
  },
  {
    separator: true,
  },
  {
    name: "embed",
    keywords: "iframe,wy,qr",
    view: commandView({
      name: "嵌入",
      icon: Browser({}),
    }),
    command: (editor) => editor.chain().setEmbed({ src: "" }).run(),
    disable: (editor) => !editor.schema.nodes.embed,
  },
];
