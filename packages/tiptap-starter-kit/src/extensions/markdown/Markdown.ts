import { Extension } from "@tiptap/core";
import ParserState from "./parser/State";
import SerializerState from "./serializer/State";
import { Mark, MarkType, Node, NodeType } from "prosemirror-model";
import { MarkdownNode } from "./types";
import { Processor } from "unified";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";

export type MarkdownStorage<T extends MarkType | NodeType> = {
  remark?: (processor: Processor) => Processor;
  parser?: {
    match: (node: MarkdownNode) => boolean;
    runner: (state: ParserState, node: MarkdownNode, type: T) => void;
  };
  serializer?: T extends MarkType
    ? {
        match: (mark: Mark) => boolean;
        runner: (
          state: SerializerState,
          mark: Mark,
          node: Node
        ) => void | boolean;
      }
    : {
        match: (node: Node) => boolean;
        runner: (state: SerializerState, node: Node) => void;
      };
};

export type NodeMarkdownStorage = MarkdownStorage<NodeType>;
export type MarkMarkdownStorage = MarkdownStorage<MarkType>;

export const Markdown = Extension.create({
  name: "markdown",
  onBeforeCreate() {
    // remark
    this.storage.remark = Object.entries(this.editor.storage)
      .filter(([key, value]) => key !== this.name && value?.remark)
      .map(([, value]) => value)
      .reduce(
        (processor, storage) => storage.remark(processor),
        remark().use(remarkGfm).use(remarkDirective) as Processor
      );
    // parser
    const parserState = new ParserState(this.editor, this.storage.remark);
    this.storage.parser = (markdown: string) => parserState.toDoc(markdown);
    // serializer
    const serializerState = new SerializerState(
      this.editor,
      this.storage.remark
    );
    this.storage.serializer = (doc: Node) => serializerState.toString(doc);
  },
});
