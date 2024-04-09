import { Node, mergeAttributes } from "@tiptap/core";

export interface DetailsContentOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
  };
}

export const DetailsContent = Node.create<DetailsContentOptions>({
  name: "detailsContent",
  group: "block",
  content: "block*",
  defining: true,
  selectable: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Details Content",
      },
    };
  },
  parseHTML() {
    return [
      { tag: `div[data-type="${this.name}"]` },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});
