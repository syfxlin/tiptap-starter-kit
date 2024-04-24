import { Extension, isActive } from "@tiptap/core";
import { Slice } from "@tiptap/pm/model";
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state";

export interface ClipboardOptions {}

export function isInCode(state: EditorState): boolean {
  try {
    return isActive(state, "codeBlock") || isActive(state, "code");
  } catch (e) {
    return false;
  }
}

export function isMarkdown(value: string): boolean {
  // code-ish
  if (value.match(/^```/gm)) {
    return true;
  }

  // link-ish
  if (value.match(/\[[^]+]\(https?:\/\/\S+\)/gm)) {
    return true;
  }
  if (value.match(/\[[^]+]\(\/\S+\)/gm)) {
    return true;
  }

  // heading-ish
  if (value.match(/^#{1,6}\s+\S+/gm)) {
    return true;
  }

  // list-ish
  // noinspection RedundantIfStatementJS
  if (value.match(/^[\d-*].?\s\S+/gm)) {
    return true;
  }

  return false;
}

export const Clipboard = Extension.create<ClipboardOptions>({
  name: "clipboard",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-handler`),
        props: {
          handlePaste: (view, event) => {
            const editable = this.editor.isEditable;
            const clipboardData = event.clipboardData;

            if (!editable || !clipboardData || clipboardData.files.length !== 0) {
              return false;
            }

            const text = clipboardData.getData("text/plain");
            const html = clipboardData.getData("text/html");

            if (html.length > 0) {
              return false;
            }

            if (isInCode(view.state)) {
              event.preventDefault();
              view.dispatch(view.state.tr.insertText(text));
              return true;
            }

            if (isMarkdown(text)) {
              const slice = this.editor.storage.markdown.parse(text);
              if (!slice || typeof slice === "string") {
                return false;
              }

              const contentSlice = view.state.selection.content();
              view.dispatch(
                view.state.tr.replaceSelection(
                  new Slice(
                    slice.content,
                    contentSlice.openStart,
                    contentSlice.openEnd,
                  ),
                ),
              );
              return true;
            }

            return false;
          },
          clipboardTextSerializer: (slice) => {
            const doc = this.editor.schema.topNodeType.createAndFill(
              undefined,
              slice.content,
            );
            if (!doc) {
              return "";
            }
            return this.editor.storage.markdown.serialize(doc);
          },
        },
      }),
    ];
  },
});
