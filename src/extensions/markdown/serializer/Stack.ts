import { Editor } from "@tiptap/core";
import { Mark } from "prosemirror-model";
import { MarkdownNode } from "../types";
import { Root } from "mdast";

export default class Stack {
  private editor: Editor;
  private marks: Mark[];
  private nodes: MarkdownNode[];

  constructor(editor: Editor) {
    this.editor = editor;
    this.marks = Mark.none;
    this.nodes = [];
  }

  private top() {
    return this.nodes[this.nodes.length - 1];
  }

  private push(node: MarkdownNode) {
    if (this.nodes.length) {
      const top = this.top();
      if (!top.children) {
        top.children = [];
      }
      top.children.push(node);
    }
  }

  public openNode(node: MarkdownNode) {
    this.nodes.push(node);
  }

  public addNode(node: MarkdownNode) {
    this.push(node);
    return node;
  }

  public closeNode() {
    const info = this.nodes.pop();
    // @ts-ignore
    return this.addNode(info);
  }

  public openMark(mark: Mark, node: MarkdownNode) {
    const isIn = mark.isInSet(this.marks);
    if (isIn) {
      return;
    }
    this.marks = mark.addToSet(this.marks);
    this.openNode(node);
  }

  public closeMark(mark: Mark) {
    if (!mark.isInSet(this.marks)) return null;
    this.marks = mark.type.removeFromSet(this.marks);
    return this.closeNode();
  }

  public toDoc() {
    let doc: Root | null = null;
    do {
      doc = this.closeNode() as Root;
    } while (this.nodes.length);
    return doc;
  }
}
