import tippy, { Instance, Props } from "tippy.js";
import { EditorView } from "@tiptap/pm/view";
import { EditorState, PluginView } from "@tiptap/pm/state";
import { Editor, isNodeSelection, posToDOMRect } from "@tiptap/core";
import { popoverAppendTo } from "../../utils/dom";

export interface FloatMenuInputViewOptions {
  id?: string;
  name: string;
  type?: string;
  value?: string;
  onEnter?: (value: string, element: HTMLInputElement) => void;
  onChange?: (value: string, element: HTMLInputElement) => void;
}

export interface FloatMenuButtonViewOptions {
  id?: string;
  name: string;
  view: string;
  shortcut?: string;
  onClick?: (element: HTMLButtonElement) => void;
}

export interface FloatMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: CSSStyleDeclaration | CSSStyleDeclaration[];
  rect?: (props: { view: FloatMenuView; editor: Editor }) => DOMRect;
  show?: (props: { view: FloatMenuView; editor: Editor }) => boolean;
  tippy?: (props: { view: FloatMenuView; editor: Editor; options: Partial<Props> }) => Partial<Props>;
  onInit?: (props: { view: FloatMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void }) => void;
  onUpdate?: (props: { view: FloatMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void; prevState?: EditorState }) => void;
  onDestroy?: (props: { view: FloatMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void }) => void;
}

export class FloatMenuView implements PluginView {
  private readonly editor: Editor;
  private readonly popover: Instance;
  private readonly element: HTMLElement;
  private readonly options: FloatMenuViewOptions;

  constructor(options: FloatMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this.element = this._element();
    this.popover = this._popover();
  }

  public show() {
    this.popover.show();
  }

  public hide() {
    this.popover.hide();
  }

  public update(view: EditorView, prevState?: EditorState) {
    const state = view.state;

    // skip render
    if (view.composing || (prevState && prevState.doc.eq(state.doc) && prevState.selection.eq(state.selection))) {
      return;
    }

    // check should show
    if (!this.options.show?.({ view: this, editor: this.editor })) {
      this.hide();
      return;
    }

    // on update
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        editor: this.editor,
        element: this.element,
        show: this.show.bind(this),
        hide: this.hide.bind(this),
      });
    }

    // reset client rect
    this.popover.setProps({ getReferenceClientRect: () => this._rect() });

    // switch to show
    this.show();
  }

  public destroy() {
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        editor: this.editor,
        element: this.element,
        show: this.show.bind(this),
        hide: this.hide.bind(this),
      });
    }
    this.popover.destroy();
  }

  public createInput(options: FloatMenuInputViewOptions) {
    const input = document.createElement("input");
    input.classList.add("tiptap-fm-input");
    if (options.id) {
      input.name = options.id;
    }
    if (options.type) {
      input.type = options.type;
    }
    if (options.value) {
      input.value = options.value;
    }
    if (options.name) {
      input.placeholder = options.name;
    }
    if (options.onEnter) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          options.onEnter?.(input.value, input);
        }
      });
    }
    if (options.onChange) {
      input.addEventListener("change", () => {
        options.onChange?.(input.value, input);
      });
    }
    return { input };
  }

  public createButton(options: FloatMenuButtonViewOptions) {
    const button = document.createElement("button");
    button.classList.add("tiptap-fm-button");
    if (options.id) {
      button.name = options.id;
    }
    if (options.view) {
      button.innerHTML = options.view;
    }
    if (options.onClick) {
      button.addEventListener("click", () => {
        options.onClick?.(button);
      });
    }

    const popover = document.createElement("div");
    popover.classList.add("tiptap-fm-button-popover");
    popover.innerHTML = options.name;
    if (options.shortcut) {
      popover.innerHTML += "&nbsp;·&nbsp;";
      options.shortcut.split("-").forEach((value, index) => {
        if (index !== 0) {
          const span = document.createElement("span");
          span.innerHTML = "&nbsp;";
          popover.append(span);
        }
        const kbd = document.createElement("kbd");
        if (navigator.userAgent.includes("Mac")) {
          kbd.textContent = value.replace(/mod/i, "Cmd");
        } else {
          kbd.textContent = value.replace(/mod/i, "Ctrl");
        }
        popover.append(kbd);
      });
    }
    const instance = tippy(button, {
      appendTo: popoverAppendTo,
      content: popover,
      arrow: false,
      inertia: true,
      theme: "tiptap-dark",
      placement: "top",
      animation: "shift-away",
      duration: [200, 150],
    });

    return { button, popover, instance };
  }

  public createDivider() {
    const divider = document.createElement("span");
    divider.classList.add("tiptap-fm-divider");
    return { divider };
  }

  private _rect() {
    if (this.options.rect) {
      return this.options.rect({ view: this, editor: this.editor });
    }
    const { view, state } = this.editor;
    if (isNodeSelection(state.selection)) {
      const node = view.nodeDOM(state.selection.from) as HTMLElement;
      if (node) {
        return node.getBoundingClientRect();
      }
    }
    return posToDOMRect(view, state.selection.from, state.selection.to);
  }

  private _element() {
    const element = document.createElement("div");
    element.classList.add("tiptap-fm");
    if (this.options.class) {
      for (const item of Array.isArray(this.options.class) ? this.options.class : [this.options.class]) {
        element.classList.add(item);
      }
    }
    if (this.options.style) {
      for (const item of Array.isArray(this.options.style) ? this.options.style : [this.options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          element.style[key] = val;
        }
      }
    }
    if (this.options.onInit) {
      this.options.onInit({
        element,
        view: this,
        editor: this.editor,
        show: this.show.bind(this),
        hide: this.hide.bind(this),
      });
    }
    return element;
  }

  private _popover() {
    const options: Partial<Props> = {
      appendTo: popoverAppendTo,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      offset: [0, 5],
      theme: "tiptap",
      trigger: "manual",
      placement: "top",
      maxWidth: "none",
    };
    return tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
  }
}
