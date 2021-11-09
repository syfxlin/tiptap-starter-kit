import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { attrs } from "./utils";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export type AudioOptions = {
  HTMLAttributes: Record<string, any>;
};

export const Audio = Node.create<AudioOptions>({
  name: "audio",
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
        tag: `audio`,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
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
      setAudio:
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
        find: /(:audio{([^}]+)})/,
        type: this.type,
        getAttributes: (match) => attrs(match[2]),
      }),
    ];
  },
});
