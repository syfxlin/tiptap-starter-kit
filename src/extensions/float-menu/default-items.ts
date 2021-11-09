import { FloatMenuItem } from "./FloatMenu";
import {
  Code,
  HighLight,
  LinkTwo,
  Strikethrough,
  TextBold,
  TextItalic,
} from "@icon-park/svg";

export const items: FloatMenuItem[] = [
  {
    name: "粗体",
    icon: TextBold({}),
    shortcut: "Ctrl B",
    active: (editor) => editor.isActive("bold"),
    command: (editor) => editor.chain().toggleBold().focus().run(),
    disable: (editor) => !editor.schema.marks.bold,
  },
  {
    name: "斜体",
    icon: TextItalic({}),
    shortcut: "Ctrl I",
    active: (editor) => editor.isActive("italic"),
    command: (editor) => editor.chain().toggleItalic().focus().run(),
    disable: (editor) => !editor.schema.marks.italic,
  },
  {
    name: "链接",
    icon: LinkTwo({}),
    shortcut: "Ctrl K",
    active: (editor) => editor.isActive("link"),
    command: (editor) => {
      editor
        .chain()
        .toggleLink({ href: "" })
        .setTextSelection(editor.state.selection.to - 1)
        .run();
    },
    disable: (editor) => !editor.schema.marks.link,
  },
  {
    name: "代码",
    icon: Code({}),
    shortcut: "Ctrl E",
    active: (editor) => editor.isActive("code"),
    command: (editor) => editor.chain().toggleCode().focus().run(),
    disable: (editor) => !editor.schema.marks.code,
  },
  {
    name: "删除线",
    icon: Strikethrough({}),
    shortcut: "Ctrl Shift X",
    active: (editor) => editor.isActive("strike"),
    command: (editor) => editor.chain().toggleStrike().focus().run(),
    disable: (editor) => !editor.schema.marks.strike,
  },
  {
    name: "高亮",
    icon: HighLight({}),
    shortcut: "Ctrl Shift H",
    active: (editor) => editor.isActive("highlight"),
    command: (editor) => editor.chain().toggleHighlight().focus().run(),
    disable: (editor) => !editor.schema.marks.highlight,
  },
];
