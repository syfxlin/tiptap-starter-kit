import { Editor } from "@tiptap/core";
import { Processor } from "unified";
import { Fragment, Mark, Node } from "@tiptap/pm/model";
import { MarkMarkdownStorage, MarkdownNode, NodeMarkdownStorage } from "../types";
import { SerializerStack } from "./stack";

export class SerializerState {
  public readonly editor: Editor;
  public readonly processor: Processor;
  private readonly stack: SerializerStack;

  constructor(editor: Editor, processor: Processor) {
    this.stack = new SerializerStack(editor);
    this.editor = editor;
    this.processor = processor;
  }

  public serialize(document: Node) {
    this.next(document);
    return this.processor.stringify(this.stack.serialize()) as string;
  }

  public next(nodes: Node | Fragment) {
    if (this.isFragment(nodes)) {
      nodes.forEach(node => this.runNode(node));
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

  private isFragment(node: Node | Fragment): node is Fragment {
    return Object.hasOwn(node, "size");
  }

  private runNode(node: Node) {
    const next = node.marks.every((mark) => {
      const storage = this.matchNode(mark)?.storage as MarkMarkdownStorage | undefined;
      return !storage?.markdown?.serializer?.apply(this, mark, node);
    });
    if (next) {
      const storage = this.matchNode(node)?.storage as NodeMarkdownStorage | undefined;
      storage?.markdown?.serializer?.apply(this, node);
    }
    for (const mark of node.marks) {
      this.stack.closeMark(mark);
    }
  }

  private matchNode(node: Node | Mark) {
    const extension = this.editor.extensionManager.extensions.find((e) => {
      const name = e.name;
      const storage = e.storage as MarkMarkdownStorage | NodeMarkdownStorage | undefined;
      return name !== "markdown" && storage?.markdown?.serializer?.match(node as Node & Mark);
    });
    if (!extension) {
      console.warn(`No serializer match ${node.type.name}`);
      return undefined;
    }
    return extension;
  }
}
