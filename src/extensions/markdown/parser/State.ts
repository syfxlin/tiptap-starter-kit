import { MarkType, Node, NodeType } from "prosemirror-model";
import { Attrs, MarkdownNode } from "../types";
import { Processor } from "unified";
import { Editor } from "@tiptap/core";
import Stack from "./Stack";

export default class State {
  public editor: Editor;
  private processor: Processor;
  private stack: Stack;

  constructor(editor: Editor, processor: Processor) {
    this.editor = editor;
    this.processor = processor;
    this.stack = new Stack(editor);
  }

  private matchRunner(node: MarkdownNode) {
    const extensions = this.editor.extensionManager.extensions.filter(
      (extension) => extension.name !== "markdown"
    );
    const extension = extensions.find((extension) =>
      extension.storage?.parser?.match?.(node)
    );
    if (!extension) {
      console.warn(`No parser match ${node.type}`);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    const { storage, type, name } = extension;
    return () => {
      storage.parser.runner(
        this,
        node,
        this.editor.schema[type === "node" ? "nodes" : "marks"][name]
      );
    };
  }

  private runNode(node: MarkdownNode) {
    const runner = this.matchRunner(node);
    runner();
  }

  public toDoc(markdown: string) {
    this.run(markdown);
    return this.stack.toDoc();
  }

  private run(markdown: string) {
    const tree = this.processor.runSync(this.processor.parse(markdown));
    this.next(tree);
    return this;
  }

  public next(nodes: MarkdownNode | MarkdownNode[] = []) {
    const extensions = this.editor.extensionManager.extensions.filter(
      (extension) => extension.name !== "parser"
    );
    [nodes].flat().forEach((node) => this.runNode(node));
    return this;
  }

  public addText(text = "") {
    this.stack.addText(text);
    return this;
  }

  public addNode(nodeType: NodeType, attrs?: Attrs, content?: Node[]) {
    this.stack.addNode(nodeType, attrs, content);
    return this;
  }

  public openNode(nodeType: NodeType, attrs?: Attrs) {
    this.stack.openNode(nodeType, attrs);
    return this;
  }

  public closeNode() {
    this.stack.closeNode();
    return this;
  }

  public openMark(markType: MarkType, attrs?: Attrs) {
    this.stack.openMark(markType, attrs);
    return this;
  }

  public closeMark(markType: MarkType) {
    this.stack.closeMark(markType);
    return this;
  }
}
