import { remark } from "remark";
import { Editor } from "@tiptap/core";
import { MarkType, Node, NodeType } from "@tiptap/pm/model";
import { Attrs, MarkMarkdownStorage, MarkdownNode, NodeMarkdownStorage } from "../types";
import { ParserStack } from "./stack";

export class ParserState {
  private stack: ParserStack;
  private editor: Editor;
  private processor: ReturnType<typeof remark>;

  constructor(editor: Editor, processor: ReturnType<typeof remark>) {
    this.stack = new ParserStack(editor);
    this.editor = editor;
    this.processor = processor;
  }

  public parse(markdown: string) {
    this.next(this.processor.runSync(this.processor.parse(markdown)));
    return this.stack.parse();
  }

  public next(nodes: MarkdownNode | MarkdownNode[] = []) {
    for (const node of [nodes].flat()) {
      this.runNode(node);
    }
    return this;
  }

  public addText(value?: string) {
    this.stack.addText(value);
    return this;
  }

  public addNode(type: NodeType, attrs?: Attrs, content?: Node[]) {
    this.stack.addNode(type, attrs, content);
    return this;
  }

  public openNode(type: NodeType, attrs?: Attrs) {
    this.stack.openNode(type, attrs);
    return this;
  }

  public closeNode() {
    this.stack.closeNode();
    return this;
  }

  public openMark(type: MarkType, attrs?: Attrs) {
    this.stack.openMark(type, attrs);
    return this;
  }

  public closeMark(type: MarkType) {
    this.stack.closeMark(type);
    return this;
  }

  private runNode(node: MarkdownNode) {
    const extension = this.matchNode(node);
    if (extension) {
      const name = extension.name;
      const type = this.editor.schema[extension.type === "node" ? "nodes" : "marks"][name] as MarkType & NodeType;
      const storage = extension.storage as MarkMarkdownStorage | NodeMarkdownStorage | undefined;
      storage?.parser?.apply(this, node, type);
    }
  }

  private matchNode(node: MarkdownNode) {
    const extension = this.editor.extensionManager.extensions.find((e) => {
      const name = e.name;
      const storage = e.storage as MarkMarkdownStorage | NodeMarkdownStorage | undefined;
      return name !== "markdown" && storage?.parser?.match(node);
    });
    if (!extension) {
      console.warn(`No parser match ${node.type}`);
      return undefined;
    }
    return extension;
  }
}
