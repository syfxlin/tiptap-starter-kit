import { Node } from "unist";

export type Attrs = Record<string, string | number | boolean | null>;

type MarkdownPropsValue =
  | string
  | number
  | boolean
  | null
  | MarkdownPropsValue[]
  | { [key: string]: MarkdownPropsValue };

export type MarkdownProps = Record<string, MarkdownPropsValue>;

export type MarkdownNode = Node & {
  children?: MarkdownNode[];
  [x: string]: any;
};
