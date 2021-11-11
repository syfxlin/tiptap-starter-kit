import { css } from "@emotion/css";
import tippy from "tippy.js";
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { newlineInCode } from "prosemirror-commands";
import { StepMap } from "prosemirror-transform";

export type ButtonViewProps = {
  id?: string;
  name: string;
  icon: (() => HTMLElement) | HTMLElement | string;
  shortcut?: string;
};

export const buttonView = (props: ButtonViewProps) => {
  // button
  const button = document.createElement("button");
  if (props.id) {
    button.classList.add(`id-${props.id}`);
  }
  button.classList.add(css`
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    outline: none;
    color: var(--tiptap-color-reverse-text);
    background-color: transparent;
    margin-left: 0.8em;
    opacity: 0.7;
    transition: opacity 150ms ease-in-out;
    cursor: pointer;

    &:first-child {
      margin-left: 0;
    }

    &.active,
    &:hover {
      opacity: 1;
    }

    &.disable {
      display: none;
    }

    svg {
      width: 1.6em;
      height: 1.6em;
    }
  `);
  if (typeof props.icon === "string") {
    button.innerHTML = props.icon;
  } else {
    button.append(typeof props.icon === "function" ? props.icon() : props.icon);
  }
  // tooltip
  const tooltip = document.createElement("div");
  tooltip.classList.add(css`
    display: flex;
    padding: 0.5em 1em;
    border-radius: 4px;
    background-color: var(--tiptap-color-reverse-background);
    color: var(--tiptap-color-reverse-text);
    font-size: 0.5em;
  `);
  tooltip.innerHTML = props.name;
  if (props.shortcut) {
    tooltip.innerHTML += `&nbsp;·&nbsp;`;
    props.shortcut.split(" ").forEach((key, index) => {
      if (index !== 0) {
        const span = document.createElement("span");
        span.textContent = "+";
        tooltip.append(span);
      }
      const kbd = document.createElement("kbd");
      kbd.classList.add(css`
        font-family: var(--tiptap-font-family-mono);
        font-size: 0.2em;
        font-weight: 700;
        background-color: var(--tiptap-color-background-secondly);
        color: var(--tiptap-color-text);
        padding: 0.05em 0.2em;
        border-radius: 4px;
        border-width: 1px 1px 2px;
        border-style: solid;
        border-color: var(--tiptap-color-border);
        line-height: 1;
      `);
      kbd.textContent = key;
      tooltip.append(kbd);
    });
  }
  // popup
  const popup = tippy(button, {
    content: tooltip,
    arrow: true,
    placement: "top",
    animation: "shift-away",
    duration: [200, 150],
    inertia: true,
  });
  return { button, tooltip, popup };
};

export type InputViewProps = {
  value?: string;
  placeholder?: string;
  type?: string;
  id?: string;
};

export const inputView = (props: InputViewProps) => {
  const input = document.createElement("input");
  input.classList.add(css`
    font-size: 0.9em;
    background: var(--tiptap-color-reverse-bakcground-secondly);
    color: var(--tiptap-color-reverse-text-secondly);
    border-radius: 2px;
    padding: 0.3em 0.5em;
    border: 0;
    margin: 0;
    outline: none;
    flex-grow: 1;
  `);
  input.classList.add(`id-${props.id}`);
  if (props.value) {
    input.value = props.value;
  }
  if (props.placeholder) {
    input.placeholder = props.placeholder;
  }
  if (props.type) {
    input.type = props.type;
  }
  return { input };
};

export const groupView = (direction: "column" | "row") => {
  const group = document.createElement("div");
  group.classList.add(css`
    display: flex;
    flex-direction: ${direction};

    > * {
      margin-top: 0.5em;

      &:first-child {
        margin-top: 0;
      }
    }
  `);
  return group;
};

export const uploadView = (props: ButtonViewProps) => {
  const button = buttonView(props);
  const file = document.createElement("input");
  file.type = "file";
  button.button.addEventListener("click", () => {
    file.click();
  });
  return {
    ...button,
    file,
  };
};

export const editorView = (
  outerView: EditorView,
  getPos: (() => number) | boolean
) => {
  let innerView: EditorView | undefined;

  const dom = document.createElement("div");
  dom.classList.add(css`
    position: relative;
    font-family: var(--tiptap-font-family-mono);
    color: var(--tiptap-color-text);
    background-color: var(--tiptap-color-background-secondly);
    display: none;
    overflow-x: auto;
    padding: 0.75em 1em;
    line-height: 1.5;
    border: 1px solid var(--tiptap-color-border);
    white-space: pre;
    tab-size: 4;
    font-size: 85%;

    &.show {
      display: block;
    }
  `);

  const open = (doc: Node) => {
    // show editor
    dom.classList.add("show");
    // init view & state
    innerView = new EditorView(dom, {
      state: EditorState.create({
        doc,
        plugins: [
          keymap({
            Tab: (state, dispatch) => {
              if (dispatch) {
                dispatch(state.tr.insertText("\t"));
              }
              return true;
            },
            Enter: newlineInCode,
            "Mod-Enter": (_, dispatch) => {
              if (dispatch) {
                const { state } = outerView;
                const { to } = state.selection;
                const tr = state.tr.replaceWith(
                  to,
                  to,
                  state.schema.nodes.paragraph.createAndFill()
                );
                outerView.dispatch(
                  tr.setSelection(TextSelection.create(tr.doc, to))
                );
                outerView.focus();
              }
              return true;
            },
          }),
        ],
      }),
      dispatchTransaction: (tr) => {
        if (!innerView) return;
        const { state, transactions } = innerView.state.applyTransaction(tr);
        innerView.updateState(state);

        if (!tr.getMeta("fromOutside")) {
          const outerTr = outerView.state.tr;
          const offsetMap = StepMap.offset((getPos as any)() + 1);

          transactions.forEach((transaction) => {
            const { steps } = transaction;
            steps.forEach((step) => {
              const mapped = step.map(offsetMap);

              if (!mapped) {
                throw Error("step discarded!");
              }
              outerTr.step(mapped);
            });
          });
          if (outerTr.docChanged) outerView.dispatch(outerTr);
        }
      },
    });
    // focus
    innerView.focus();
  };

  const update = (node: Node) => {
    if (innerView) {
      const state = innerView.state;
      const start = node.content.findDiffStart(state.doc.content);
      if (start !== null && start !== undefined) {
        const diff = node.content.findDiffEnd(state.doc.content);
        if (diff) {
          let { a: endA, b: endB } = diff;
          const overlap = start - Math.min(endA, endB);
          if (overlap > 0) {
            endA += overlap;
            endB += overlap;
          }
          innerView.dispatch(
            state.tr
              .replace(start, endB, node.slice(start, endA))
              .setMeta("fromOutside", true)
          );
        }
      }
    }
  };

  const close = () => {
    if (innerView) {
      innerView.destroy();
    }
    innerView = undefined;
    dom.classList.remove("show");
  };

  const stopEvent = (event: Event) => {
    const { target } = event;
    const isChild = target && innerView?.dom.contains(target as Element);
    return !!(innerView && isChild);
  };

  return {
    dom,
    view: () => innerView,
    open,
    update,
    close,
    stopEvent,
  };
};
