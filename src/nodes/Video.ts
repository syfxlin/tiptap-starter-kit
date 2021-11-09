import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";
import { attrs } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type VideoOptions = {
  HTMLAttributes: Record<string, any>;
};

export const Video = Node.create<VideoOptions>({
  name: "video",
  inline: true,
  group: "inline",
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(
        {
          controls: "true",
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },
  addStorage() {
    return {
      parser: {
        match: (node) =>
          node.type === "textDirective" && node.name === this.name,
        runner: (state, node, type) => {
          state.addNode(type, node.attributes);
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "textDirective",
            name: this.name,
            attributes: node.attrs,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /(:video{([^}]+)})/,
        type: this.type,
        getAttributes: (match) => attrs(match[2]),
      }),
    ];
  },
});
