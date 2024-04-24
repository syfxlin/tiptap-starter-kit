import tippy, { Instance, Props } from "tippy.js";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import { Editor, Range } from "@tiptap/core";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

export type BlockMenuViewItem = "|" | {
  action: (props: { editor: Editor; view: BlockMenuView; range: Range; element: HTMLElement }) => void;
  render: (props: { editor: Editor; view: BlockMenuView; range: Range; element: HTMLElement }) => void;
  [key: string]: any;
};

export interface BlockMenuButtonViewOptions {
  id?: string;
  name: string;
  icon?: string;
  shortcut?: string;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
}

export interface BlockMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  tippy?: (props: { editor: Editor; view: BlockMenuView; options: Partial<Props> }) => Partial<Props>;
  onInit?: (props: { editor: Editor; view: BlockMenuView; range: Range; element: HTMLElement }) => void;
  onUpdate?: (props: { editor: Editor; view: BlockMenuView; range: Range; element: HTMLElement }) => void;
  onDestroy?: (props: { editor: Editor; view: BlockMenuView; range: Range; element: HTMLElement }) => void;
  dictionary: {
    empty: string;
  };
}

export class BlockMenuView {
  private readonly editor: Editor;
  private readonly options: BlockMenuViewOptions;

  private _popover: Instance | undefined;
  private _element: HTMLElement | undefined;
  private _index: number | undefined;
  private _items: Array<BlockMenuViewItem> | undefined;

  public static create(options: BlockMenuViewOptions) {
    return () => new BlockMenuView(options);
  }

  constructor(options: BlockMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
  }

  public onStart(props: SuggestionProps) {
    this._index = 0;
    this._items = [];
    // element
    this._element = document.createElement("div");
    this._element.classList.add("ProseMirror-bm");
    if (this.options.class) {
      for (const item of Array.isArray(this.options.class) ? this.options.class : [this.options.class]) {
        this._element.classList.add(item);
      }
    }
    if (this.options.style) {
      for (const item of Array.isArray(this.options.style) ? this.options.style : [this.options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          this._element.style[key] = val;
        }
      }
    }
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        range: props.range,
        editor: this.editor,
        element: this._element,
      });
    }
    // popover
    const options: Partial<Props> = {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this._element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror",
      trigger: "manual",
      placement: "top-start",
      maxWidth: "none",
    };
    this._popover = tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
    this.onUpdate(props);
  }

  public onUpdate(props: SuggestionProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._items === undefined) {
      return;
    }

    // items
    this._items = props.items;

    // update
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        range: props.range,
        editor: this.editor,
        element: this._element,
      });
    }

    // render
    this._render(props.range);

    // client rect
    // @ts-expect-error
    this._popover.setProps({ getReferenceClientRect: props.clientRect });
  }

  public onKeyDown(props: SuggestionKeyDownProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._items === undefined) {
      return false;
    }

    if (props.event.key === "Escape") {
      if (this._popover) {
        this._popover.hide();
      }
      return true;
    }
    if (props.event.key === "Enter") {
      const item = this._items[this._index];
      if (item && typeof item !== "string" && item.action) {
        item.action({
          view: this,
          range: props.range,
          editor: this.editor,
          element: this._element,
        });
      }
      return true;
    }
    if (props.event.key === "ArrowUp") {
      const prev = this._index - 1;
      const index = this._items[prev] && typeof this._items[prev] === "string" ? prev - 1 : prev;
      this._index = index < 0 ? this._items.length - 1 : index;
      this._render(props.range);
      return true;
    }
    if (props.event.key === "ArrowDown") {
      const next = this._index + 1;
      const index = this._items[next] && typeof this._items[next] === "string" ? next + 1 : next;
      this._index = index >= this._items.length ? 0 : index;
      this._render(props.range);
      return true;
    }
    return false;
  }

  public onExit(props: SuggestionProps) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._items === undefined) {
      return;
    }

    this._popover.hide();
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        range: props.range,
        editor: this.editor,
        element: this._element,
      });
    }

    this._popover.destroy();
    this._element.remove();
    this._index = undefined;
    this._items = undefined;
    this._element = undefined;
    this._popover = undefined;
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

  private _render(range: Range) {
    if (this._element === undefined || this._popover === undefined || this._index === undefined || this._items === undefined) {
      return;
    }

    this._element.innerHTML = "";
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
          item.render({
            range,
            view: this,
            editor: this.editor,
            element: view,
          });
          view.addEventListener("click", () => {
            if (this._element) {
              item.action({
                range,
                view: this,
                editor: this.editor,
                element: view,
              });
            }
          });
          nodes.push(view);
        }
      }
      this._element.append(...nodes);
      // noinspection JSIgnoredPromiseFromCall
      scrollIntoView(nodes[this._index], {
        block: "center",
        scrollMode: "if-needed",
        boundary: parent => parent !== this._element,
      });
    } else {
      const view = document.createElement("div");
      view.classList.add("ProseMirror-bm-empty");
      view.textContent = this.options.dictionary.empty;
      this._element.append(view);
    }
    this._popover.show();
  }
}
