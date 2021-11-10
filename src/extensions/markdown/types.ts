import { Node } from "unist";

export type Attrs = Record<string, string | number | boolean | null>;

export type MarkdownNode = Node & {
  children?: MarkdownNode[];
  [x: string]: any;
};
