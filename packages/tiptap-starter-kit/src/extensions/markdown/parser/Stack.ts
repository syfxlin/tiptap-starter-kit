import { Editor } from "@tiptap/core";
import { Mark, MarkType, Node, NodeType } from "prosemirror-model";
import { Attrs } from "../types";

export default class Stack {
  private editor: Editor;
  private marks: Mark[];
  private nodes: { type: NodeType; attrs?: Attrs; content: Node[] }[];

  constructor(editor: Editor) {
    this.editor = editor;
    this.marks = Mark.none;
    this.nodes = [];
  }

  private top() {
    return this.nodes[this.nodes.length - 1];
  }

  private push(node: Node) {
    if (this.nodes.length) {
      this.top().content.push(node);
    }
  }

  private maybeMerge(a: Node, b: Node) {
    if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks)) {
      // @ts-ignore
      return this.editor.schema.text(a.text + b.text, a.marks);
    }
  }

  public addText(text: string) {
    if (!text) {
      return;
    }
    const nodes = this.top().content;
    const last = nodes[nodes.length - 1];
    const node = this.editor.schema.text(text, this.marks);
    const merged = last && this.maybeMerge(last, node);
    if (merged) {
      nodes[nodes.length - 1] = merged;
    } else {
      nodes.push(node);
    }
    return this;
  }

  public openMark(markType: MarkType, attrs?: Attrs) {
    const mark = markType.create(attrs);
    this.marks = mark.addToSet(this.marks);
    return this;
  }

  public closeMark(markType: MarkType) {
    this.marks = markType.removeFromSet(this.marks);
  }

  public openNode(nodeType: NodeType, attrs?: Attrs) {
    this.nodes.push({
      type: nodeType,
      attrs,
      content: [],
    });
  }

  public addNode(nodeType: NodeType, attrs?: Attrs, content?: Node[]) {
    const node = nodeType.createAndFill(attrs, content, this.marks);
    if (!node) {
      return null;
    }
    this.push(node);
    return node;
  }

  public closeNode() {
    this.marks = Mark.none;
    const info = this.nodes.pop();
    // @ts-ignore
    return this.addNode(info.type, info.attrs, info.content);
  }

  public toDoc() {
    let doc: Node | null = null;
    do {
      doc = this.closeNode();
    } while (this.nodes.length);
    return doc;
  }
}
