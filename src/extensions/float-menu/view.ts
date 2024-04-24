import tippy, { Instance, Props } from "tippy.js";
import { EditorView } from "@tiptap/pm/view";
import { EditorState, PluginView } from "@tiptap/pm/state";
import { Editor, Range, isNodeSelection, posToDOMRect } from "@tiptap/core";

export interface FloatMenuInputViewOptions {
  id?: string;
  name: string;
  type?: string;
  value?: string;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  onEnter?: (value: string, element: HTMLInputElement) => void;
  onInput?: (value: string, element: HTMLInputElement) => void;
  onChange?: (value: string, element: HTMLInputElement) => void;
  onKey?: (key: Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey" | "shiftKey">, value: string, element: HTMLInputElement) => void;
  onBoundary?: (boundary: "left" | "right", value: string, element: HTMLInputElement) => void;
}

export interface FloatMenuButtonViewOptions {
  id?: string;
  name: string;
  view: string;
  shortcut?: string;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  onClick?: (element: HTMLButtonElement) => void;
}

export interface FloatMenuUploadViewOptions extends Omit<FloatMenuButtonViewOptions, "onClick"> {
  accept?: string;
  onUpload?: (element: HTMLInputElement) => void;
}

export interface FloatMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  rect?: (props: { view: FloatMenuView; editor: Editor }) => DOMRect;
  show?: (props: { view: FloatMenuView; editor: Editor }) => boolean;
  tippy?: (props: { view: FloatMenuView; editor: Editor; options: Partial<Props> }) => Partial<Props>;
  onInit?: (props: { view: FloatMenuView; editor: Editor; range: Range; element: HTMLElement }) => void;
  onUpdate?: (props: { view: FloatMenuView; editor: Editor; range: Range; element: HTMLElement }) => void;
  onDestroy?: (props: { view: FloatMenuView; editor: Editor; range: Range; element: HTMLElement }) => void;
}

export class FloatMenuView implements PluginView {
  private readonly editor: Editor;
  private readonly popover: Instance;
  private readonly element: HTMLElement;
  private readonly options: FloatMenuViewOptions;

  public static create(options: FloatMenuViewOptions) {
    return () => new FloatMenuView(options);
  }

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
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
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
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
      });
    }
    this.popover.destroy();
    this.element.remove();
  }

  public createInput(options: FloatMenuInputViewOptions) {
    const input = document.createElement("input");
    input.classList.add("ProseMirror-fm-input");
    if (options.id) {
      input.name = options.id;
    }
    if (options.name) {
      input.placeholder = options.name;
    }
    if (options.type) {
      input.type = options.type;
    }
    if (options.value) {
      input.value = options.value;
    }
    if (options.class) {
      for (const item of Array.isArray(options.class) ? options.class : [options.class]) {
        input.classList.add(item);
      }
    }
    if (options.style) {
      for (const item of Array.isArray(options.style) ? options.style : [options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          input.style[key] = val;
        }
      }
    }
    if (options.onEnter) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          options.onEnter?.(input.value, input);
        }
      });
    }
    if (options.onInput) {
      input.addEventListener("input", () => {
        options.onInput?.(input.value, input);
      });
    }
    if (options.onChange) {
      input.addEventListener("change", () => {
        options.onChange?.(input.value, input);
      });
    }
    if (options.onKey) {
      input.addEventListener("keydown", (e) => {
        options.onKey?.({
          key: e.key,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        }, input.value, input);
      });
    }
    if (options.onBoundary) {
      let pos = -1;
      input.addEventListener("mouseup", () => {
        if (input.selectionStart === null) {
          return;
        }
        if (input.selectionStart !== input.selectionEnd) {
          return;
        }
        pos = input.selectionStart;
      });
      input.addEventListener("keyup", (e) => {
        if (input.selectionStart === null) {
          return;
        }
        if (input.selectionStart !== input.selectionEnd) {
          return;
        }
        if (options.onBoundary && e.key === "ArrowLeft" && pos === 0) {
          options.onBoundary("left", input.value, input);
        }
        if (options.onBoundary && e.key === "ArrowRight" && (pos === -1 || pos === input.value.length)) {
          options.onBoundary("right", input.value, input);
        }
        pos = input.selectionStart;
      });
    }
    return { input };
  }

  public createButton(options: FloatMenuButtonViewOptions) {
    const button = document.createElement("button");
    button.classList.add("ProseMirror-fm-button");
    if (options.id) {
      button.name = options.id;
    }
    if (options.view) {
      button.innerHTML = options.view;
    }
    if (options.class) {
      for (const item of Array.isArray(options.class) ? options.class : [options.class]) {
        button.classList.add(item);
      }
    }
    if (options.style) {
      for (const item of Array.isArray(options.style) ? options.style : [options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          button.style[key] = val;
        }
      }
    }
    if (options.onClick) {
      button.addEventListener("click", () => {
        options.onClick?.(button);
      });
    }

    const popover = document.createElement("div");
    popover.classList.add("ProseMirror-fm-button-popover");
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
      appendTo: () => document.body,
      content: popover,
      arrow: false,
      inertia: true,
      theme: "ProseMirror-dark",
      placement: "top",
      animation: "shift-away",
      duration: [200, 150],
    });

    return { button, popover, instance };
  }

  public createUpload(options: FloatMenuUploadViewOptions) {
    const file = document.createElement("input");
    file.type = "file";
    if (options.accept) {
      file.accept = options.accept;
    }
    file.addEventListener("change", () => {
      options.onUpload?.(file);
    });
    const button = this.createButton({ ...options, onClick: () => file.click() });
    return { ...button, file };
  }

  public createGroup(direction: "column" | "row") {
    const element = document.createElement("div");
    element.classList.add("ProseMirror-fm-group");
    element.style.flexDirection = direction;
    return element;
  }

  public createDivider() {
    const divider = document.createElement("span");
    divider.classList.add("ProseMirror-fm-divider");
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
    element.classList.add("ProseMirror-fm");
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
        range: {
          from: Math.min(...this.editor.state.selection.ranges.map(range => range.$from.pos)),
          to: Math.max(...this.editor.state.selection.ranges.map(range => range.$to.pos)),
        },
      });
    }
    return element;
  }

  private _popover() {
    const options: Partial<Props> = {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror",
      trigger: "manual",
      placement: "top",
      maxWidth: "none",
    };
    return tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
  }
}
