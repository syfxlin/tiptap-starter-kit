import { Editor } from "@tiptap/core";
import Stack from "./Stack";
import { Processor } from "unified";
import { Fragment, Mark, Node } from "prosemirror-model";
import { MarkdownNode } from "../types";

const isFragment = (x: Node | Fragment): x is Fragment =>
  Object.prototype.hasOwnProperty.call(x, "size");

export default class State {
  public editor: Editor;
  private processor: Processor;
  private stack: Stack;

  constructor(editor: Editor, processor: Processor) {
    this.editor = editor;
    this.processor = processor;
    this.stack = new Stack(editor);
  }

  private matchRunner(node: Node | Mark) {
    const extensions = this.editor.extensionManager.extensions.filter(
      (extension) => extension.name !== "markdown"
    );
    const extension = extensions.find((extension) =>
      extension.storage?.serializer?.match?.(node as Node & Mark)
    );
    if (!extension) {
      console.warn(`No serializer match ${node.type.name}`);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    const { storage } = extension;
    return (mark?: Mark) => {
      if (mark) {
        return storage.serializer.runner(this, mark, node);
      } else {
        return storage.serializer.runner(this, node);
      }
    };
  }

  private runNode(node: Node) {
    const marks = node.marks;
    const next = marks.every((mark) => !this.matchRunner(mark)(mark));
    if (next) {
      this.matchRunner(node)();
    }
    marks.forEach((mark) => this.stack.closeMark(mark));
  }

  public toString(doc: Node) {
    this.run(doc);
    return this.processor.stringify(this.stack.toDoc()) as string;
  }

  public run(tree: Node) {
    this.next(tree);
    return this;
  }

  public next(nodes: Node | Fragment) {
    if (isFragment(nodes)) {
      nodes.forEach((node) => {
        this.runNode(node);
      });
      return this;
    }
    this.runNode(nodes);
    return this;
  }

  public addNode(node: MarkdownNode) {
    this.stack.addNode(node);
    return this;
  }

  public openNode(node: MarkdownNode) {
    this.stack.openNode(node);
    return this;
  }

  public closeNode() {
    this.stack.closeNode();
    return this;
  }

  public withMark(mark: Mark, node: MarkdownNode) {
    this.stack.openMark(mark, node);
    return this;
  }
}
