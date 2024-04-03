import { Editor } from "@tiptap/core";
import tippy, { Instance, Props } from "tippy.js";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

export type BlockMenuViewItem = "|" | {
  action: (editor: Editor, view: BlockMenuView) => void;
  render: (editor: Editor, view: BlockMenuView, element: HTMLElement) => void;
  [key: string]: any;
};

export interface BlockMenuButtonViewOptions {
  id?: string;
  name: string;
  icon?: string;
  shortcut?: string;
  class?: string | string[];
  style?: CSSStyleDeclaration | CSSStyleDeclaration[];
}

export interface BlockMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: CSSStyleDeclaration | CSSStyleDeclaration[];
  tippy?: (props: { view: BlockMenuView; editor: Editor; options: Partial<Props> }) => Partial<Props>;
  onInit?: (props: { view: BlockMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void }) => void;
  onUpdate?: (props: { view: BlockMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void; items: Array<BlockMenuViewItem> }) => void;
  onDestroy?: (props: { view: BlockMenuView; editor: Editor; element: HTMLElement; show: () => void; hide: () => void }) => void;
  dictionary: {
    empty: string;
  };
}

export class BlockMenuView {
  private readonly editor: Editor;
  private readonly popover: Instance;
  private readonly element: HTMLElement;
  private readonly options: BlockMenuViewOptions;

  private _index: number;
  private _items: Array<BlockMenuViewItem>;

  public static create(options: BlockMenuViewOptions) {
    return () => new BlockMenuView(options);
  }

  constructor(options: BlockMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this.element = this._element();
    this.popover = this._popover();
    this._index = 0;
    this._items = [];
  }

  public show() {
    this.popover.show();
  }

  public hide() {
    this.popover.hide();
  }

  public update(items: Array<BlockMenuViewItem>, clientRect?: (() => DOMRect | null) | null) {
    // items
    this._items = items;

    // update
    if (this.options.onUpdate) {
      this.options.onUpdate({
        items,
        view: this,
        editor: this.editor,
        element: this.element,
        show: this.show.bind(this),
        hide: this.hide.bind(this),
      });
    }

    // render
    this._render();

    // client rect
    // @ts-expect-error
    this.popover.setProps({ getReferenceClientRect: clientRect });
  }

  public keydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.hide();
      return true;
    }
    if (event.key === "Enter") {
      const item = this._items[this._index];
      if (item && typeof item !== "string" && item.action) {
        item.action(this.editor, this);
      }
      return true;
    }
    if (event.key === "ArrowUp") {
      const prev = this._index - 1;
      const index = this._items[prev] && typeof this._items[prev] === "string" ? prev - 1 : prev;
      this._index = index < 0 ? this._items.length - 1 : index;
      this._render();
      return true;
    }
    if (event.key === "ArrowDown") {
      const next = this._index + 1;
      const index = this._items[next] && typeof this._items[next] === "string" ? next + 1 : next;
      this._index = index >= this._items.length ? 0 : index;
      this._render();
      return true;
    }
    return false;
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

  public onStart(props: SuggestionProps) {
    this._index = 0;
    this._items = [];
    this.update(props.items, props.clientRect);
  }

  public onUpdate(props: SuggestionProps) {
    this.update(props.items, props.clientRect);
  }

  public onKeyDown(props: SuggestionKeyDownProps) {
    return this.keydown(props.event);
  }

  public onExit() {
    this.hide();
    this._index = 0;
    this._items = [];
  }

  public createButton(element: HTMLElement, options: BlockMenuButtonViewOptions) {
    if (options.id) {
      element.setAttribute("name", options.id);
    }
    if (options.class) {
      for (const item of Array.isArray(options.class) ? options.class : [options.class]) {
        element.classList.add(item);
      }
    }
    if (options.style) {
      for (const item of Array.isArray(options.style) ? options.style : [options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          element.style[key] = val;
        }
      }
    }
    // icon
    if (options.icon) {
      const icon = document.createElement("div");
      icon.classList.add("ProseMirror-bm-button-icon");
      icon.innerHTML = options.icon;
      element.append(icon);
    }
    // name
    const name = document.createElement("div");
    name.classList.add("ProseMirror-bm-button-name");
    name.textContent = options.name;
    element.append(name);
    // shortcut
    if (options.shortcut) {
      options.shortcut.split("-").forEach((value, index) => {
        if (index !== 0) {
          const span = document.createElement("span");
          span.innerHTML = "+";
          element.append(span);
        }
        const kbd = document.createElement("kbd");
        if (navigator.userAgent.includes("Mac")) {
          kbd.textContent = value.replace(/mod/i, "Cmd");
        } else {
          kbd.textContent = value.replace(/mod/i, "Ctrl");
        }
        element.append(kbd);
      });
    }
  }

  private _render() {
    this.element.innerHTML = "";
    this._index = Math.min(this._index, Math.max(0, this._items.length - 1));
    if (this._items.length) {
      const nodes: Array<HTMLElement> = [];
      for (let i = 0; i < this._items.length; i++) {
        const item = this._items[i];
        if (item === "|") {
          const view = document.createElement("div");
          view.classList.add("ProseMirror-bm-divider");
          nodes.push(view);
        } else {
          const view = document.createElement("button");
          view.classList.add("ProseMirror-bm-button");
          if (i === this._index) {
            view.classList.add("active");
          }
          item.render(this.editor, this, view);
          view.addEventListener("click", () => {
            item.action(this.editor, this);
          });
          nodes.push(view);
        }
      }
      this.element.append(...nodes);
      scrollIntoView(nodes[this._index], {
        block: "center",
        scrollMode: "if-needed",
        boundary: parent => parent !== this.element,
      });
    } else {
      const view = document.createElement("div");
      view.classList.add("ProseMirror-bm-empty");
      view.textContent = this.options.dictionary.empty;
      this.element.append(view);
    }
    this.show();
  }

  private _element() {
    const element = document.createElement("div");
    element.classList.add("ProseMirror-bm");
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
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror",
      trigger: "manual",
      placement: "top-start",
      maxWidth: "none",
    };
    return tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
  }
}
