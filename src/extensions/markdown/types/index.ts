import { Node as UnistNode } from "unist";
import { Processor } from "unified";
import { Mark, MarkType, Node, NodeType } from "@tiptap/pm/model";
import { Data } from "mdast";
import { ParserState } from "../parser/state";
import { SerializerState } from "../serializer/state";

export interface Attrs {
  [key: string]: any;
}

export interface MarkdownNode extends UnistNode {
  data?: Data & Record<string, any>;
  children?: Array<MarkdownNode>;
  [key: string]: any;
}

export interface MarkMarkdownStorage {
  processor?: (processor: Processor) => Processor;
  parser?: {
    match: (node: MarkdownNode) => boolean;
    apply: (state: ParserState, node: MarkdownNode, type: MarkType) => void;
  };
  serializer?: {
    match: (mark: Mark) => boolean;
    apply: (state: SerializerState, mark: Mark, node: Node) => void | boolean;
  };
}

export interface NodeMarkdownStorage {
  processor?: (processor: Processor) => Processor;
  parser?: {
    match: (node: MarkdownNode) => boolean;
    apply: (state: ParserState, node: MarkdownNode, type: NodeType) => void;
  };
  serializer?: {
    match: (node: Node) => boolean;
    apply: (state: SerializerState, node: Node) => void;
  };
}

declare module "unist" {
  interface Data {
    hName?: string;
    hProperties?: {
      className?: string[];
    };
  }
}
