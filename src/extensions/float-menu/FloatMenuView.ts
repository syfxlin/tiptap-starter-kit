import { Editor, isNodeSelection, posToDOMRect, Range } from "@tiptap/core";
import tippy, { Instance, Props } from "tippy.js";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { css } from "@emotion/css";

export type FloatMenuViewOptions = {
  editor: Editor;
  getReferenceClientRect?: (props: {
    editor: Editor;
    range: Range;
    oldState?: EditorState;
  }) => DOMRect;
  shouldShow: (props: {
    editor: Editor;
    range: Range;
    oldState?: EditorState;
  }) => boolean;
  init: (dom: HTMLElement, editor: Editor) => void;
  update?: (
    dom: HTMLElement,
    props: {
      editor: Editor;
      oldState?: EditorState;
      range: Range;
      show: () => void;
      hide: () => void;
    }
  ) => void;
  tippyOptions?: Partial<Props>;
};

export default class FloatMenuView {
  public editor: Editor;
  private dom: HTMLElement;
  private popup: Instance;
  private _update: FloatMenuViewOptions["update"];
  private shouldShow: FloatMenuViewOptions["shouldShow"];
  private getReferenceClientRect: NonNullable<
    FloatMenuViewOptions["getReferenceClientRect"]
  > = ({ editor, range }) => {
    const { view, state } = editor;
    if (isNodeSelection(state.selection)) {
      const node = view.nodeDOM(range.from) as HTMLElement;

      if (node) {
        return node.getBoundingClientRect();
      }
    }
    return posToDOMRect(view, range.from, range.to);
  };

  constructor(props: FloatMenuViewOptions) {
    this.editor = props.editor;
    this.shouldShow = props.shouldShow;
    if (props.getReferenceClientRect) {
      this.getReferenceClientRect = props.getReferenceClientRect;
    }
    this._update = props.update;
    // root
    this.dom = document.createElement("div");
    this.dom.classList.add(css`
      display: flex;
      padding: 0.5em 0.7em;
      background-color: var(--tiptap-color-reverse-background);
      border-radius: 4px;

      &::before {
        content: "";
        display: block;
        position: absolute;
        width: 1.25em;
        height: 1.25em;
        background: var(--tiptap-color-reverse-background);
        border-radius: 3px;
        z-index: -1;
        pointer-events: none;

        [data-placement="top"] & {
          transform: translateX(-50%) rotate(45deg);
          left: 50%;
          bottom: -2px;
        }

        [data-placement="bottom"] & {
          transform: translateX(-50%) rotate(45deg);
          left: 50%;
          top: -2px;
        }

        [data-placement="left"] & {
          transform: translateY(-50%) rotate(45deg);
          top: 50%;
          right: -2px;
        }

        [data-placement="right"] & {
          transform: translateY(-50%) rotate(45deg);
          top: 50%;
          left: -2px;
        }
      }

      * {
        box-sizing: border-box;
      }

      @media print {
        display: none;
      }
    `);

    // init
    props.init(this.dom, this.editor);

    // popup
    this.popup = tippy(document.body, {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.dom,
      interactive: true,
      trigger: "manual",
      placement: "top",
      ...(props.tippyOptions ?? {}),
    });
  }

  public update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view;
    const { doc, selection } = state;
    const isSame =
      oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection);

    if (composing || isSame) {
      return;
    }

    const { ranges } = selection;
    const from = Math.min(...ranges.map((range) => range.$from.pos));
    const to = Math.max(...ranges.map((range) => range.$to.pos));

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      oldState,
      range: {
        from,
        to,
      },
    });

    if (!shouldShow) {
      this.hide();
      return;
    }

    // update
    this._update?.(this.dom, {
      editor: this.editor,
      oldState,
      range: {
        from,
        to,
      },
      show: this.show.bind(this),
      hide: this.hide.bind(this),
    });

    // pos
    this.popup.setProps({
      getReferenceClientRect: () =>
        this.getReferenceClientRect({
          editor: this.editor,
          oldState,
          range: {
            from,
            to,
          },
        }),
    });

    // show
    this.show();
  }

  show() {
    this.popup.show();
  }

  hide() {
    this.popup.hide();
  }

  public destroy() {
    this.popup.destroy();
  }
}
