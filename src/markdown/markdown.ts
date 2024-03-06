import { remark } from "remark";
import { Extension } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { ParserState } from "./parser/state";
import { SerializerState } from "./serializer/state";

export interface MarkdownOptions {}

export interface MarkdownStorage {
  remark: ReturnType<typeof remark>;
  parse: (markdown: string) => Node | null;
  serialize: (document: Node) => string;
  get: () => string;
  set: (markdown: string, emit?: boolean) => void;
}

export const Markdown = Extension.create<MarkdownOptions, MarkdownStorage>({
  name: "markdown",
  onBeforeCreate() {
    // processor
    this.storage.remark = remark();
    for (const [key, value] of Object.entries(this.editor.storage)) {
      if (key !== this.name && value.remark) {
        this.storage.remark = this.storage.remark.use(value);
      }
    }
    // parser
    this.storage.parse = (markdown: string) => {
      return new ParserState(this.editor, this.storage.remark).parse(markdown);
    };
    // serializer
    this.storage.serialize = (document: Node) => {
      return new SerializerState(this.editor, this.storage.remark).serialize(document);
    };
    // get
    this.storage.get = () => {
      return this.editor.storage[this.name].serialize(this.editor.state.doc) as string;
    };
    // set
    this.storage.set = (markdown: string, emit?: boolean) => {
      const tr = this.editor.state.tr;
      const doc = this.editor.storage[this.name].parse(markdown);
      this.editor.view.dispatch(tr.replaceWith(0, tr.doc.content.size, doc).setMeta("preventUpdate", !emit));
    };
  },
});
