import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Slice } from "prosemirror-model";

export const Clipboard = Extension.create({
  name: "clipboard",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("clipboard"),
        props: {
          handlePaste: (view, event) => {
            const editable = this.editor.isEditable;
            const { clipboardData } = event;
            if (
              !editable ||
              !clipboardData ||
              clipboardData.files.length !== 0
            ) {
              return false;
            }

            const text = clipboardData.getData("text/plain");
            const html = clipboardData.getData("text/html");
            if (html.length > 0) {
              return false;
            }

            const slice = this.editor.storage.markdown.parser(text);
            if (!slice || typeof slice === "string") return false;

            const contentSlice = view.state.selection.content();
            view.dispatch(
              view.state.tr.replaceSelection(
                new Slice(
                  slice.content,
                  contentSlice.openStart,
                  contentSlice.openEnd
                )
              )
            );

            return true;
          },
          clipboardTextSerializer: (slice) => {
            const doc = this.editor.schema.topNodeType.createAndFill(
              undefined,
              slice.content
            );
            if (!doc) {
              return "";
            }
            return this.editor.storage.markdown.serializer(doc);
          },
        },
      }),
    ];
  },
});
