import { Node, mergeAttributes } from "@tiptap/core";

export interface DetailsSummaryOptions {
  HTMLAttributes: Record<string, any>;
  dictionary: {
    name: string;
  };
}

export const DetailsSummary = Node.create<DetailsSummaryOptions>({
  name: "detailsSummary",
  group: "block",
  content: "inline*",
  defining: true,
  isolating: true,
  selectable: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      dictionary: {
        name: "Details Summary",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "summary",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});
