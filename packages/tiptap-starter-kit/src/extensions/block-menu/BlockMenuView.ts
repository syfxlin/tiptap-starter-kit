import tippy, { Instance, Props } from "tippy.js";
import { css } from "@emotion/css";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import { Editor } from "@tiptap/core";

export type BlockMenuViewItem =
  | {
      separator: true;
    }
  | {
      separator?: false;
      view: (dom: HTMLElement) => void;
      [key: string]: any;
    };

export type BlockMenuViewOptions = {
  editor: Editor;
  tippyOptions?: Partial<Props>;
  dictionary: {
    queryEmpty: string;
  };
};

export default class BlockMenuView {
  private editor: Editor;
  private dictionary: BlockMenuViewOptions["dictionary"];
  private popup: Instance;
  private dom: HTMLElement;
  private selected: number;
  private items: BlockMenuViewItem[];
  private command: (props: any) => void;

  constructor(options: BlockMenuViewOptions) {
    this.editor = options.editor;
    this.dictionary = options.dictionary;
    // root
    this.dom = document.createElement("div");
    this.dom.id = `id-${Math.random().toString(36).substring(2, 10)}`;
    this.dom.classList.add(css`
      color: var(--tiptap-color-text);
      background-color: var(--tiptap-color-background);
      z-index: 9999;
      border-radius: 4px;
      box-shadow: rgba(0, 0, 0, 0.05) 0 0 0 1px, rgba(0, 0, 0, 0.08) 0 4px 8px,
        rgba(0, 0, 0, 0.08) 0 2px 4px;
      transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
        transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transition-delay: 150ms;
      line-height: 0;
      box-sizing: border-box;
      pointer-events: all;
      white-space: nowrap;
      width: 300px;
      max-height: 224px;
      overflow: hidden;
      overflow-y: auto;
      padding: 0.5em 0;

      * {
        box-sizing: border-box;
      }

      @media print {
        display: none;
      }
    `);
    // popup
    this.popup = tippy(document.body, {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      showOnCreate: true,
      interactive: true,
      trigger: "manual",
      placement: "top-start",
      content: this.dom,
      ...(options.tippyOptions ?? {}),
    });

    // init
    this.selected = 0;
    this.items = [];
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.command = () => {};
  }

  public update(props: SuggestionProps) {
    // pos
    this.popup.setProps({
      getReferenceClientRect: props.clientRect,
    });
    // items
    this.items = props.items;
    this.command = props.command;
    // render
    this.render();
  }

  public render() {
    this.dom.innerHTML = "";
    if (this.items.length > 0) {
      const nodes = this.items.map((item, index) => {
        if (!item.separator) {
          const button = document.createElement("button");
          button.classList.add(css`
            appearance: none;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-weight: 500;
            font-size: 0.8em;
            line-height: 1;
            width: 100%;
            height: 2.8em;
            cursor: pointer;
            border: none;
            outline: none;
            color: var(--tiptap-color-text);
            padding: 0 1em;

            background-color: ${this.selected === index
              ? "var(--tiptap-color-background-hover)"
              : "var(--tiptap-color-background)"};

            &:hover {
              background-color: var(--tiptap-color-background-hover);
            }
          `);
          button.addEventListener("click", () => {
            this.command(item);
          });
          item.view(button);
          return button;
        } else {
          const separator = document.createElement("div");
          separator.classList.add(css`
            border-top: 1px solid var(--tiptap-color-background-hover);
            margin: 0.5em 0;
          `);
          return separator;
        }
      });
      this.dom.append(...nodes);
      // scroll
      scrollIntoView(nodes[this.selected], {
        scrollMode: "if-needed",
        block: "center",
        boundary: (parent) => parent.id !== this.dom.id,
      });
    } else {
      const empty = document.createElement("div");
      empty.classList.add(css`
        display: flex;
        align-items: center;
        color: var(--tiptap-color-text);
        font-weight: 500;
        font-size: 0.8em;
        height: 2.8em;
        padding: 0 1em;
      `);
      empty.textContent = this.dictionary.queryEmpty;
      this.dom.append(empty);
    }
  }

  public onKeyDown(props: SuggestionKeyDownProps): boolean {
    const e = props.event;
    if (e.key === "Escape") {
      this.popup.hide();
      return true;
    }
    if (e.key === "Enter") {
      const item = this.items[this.selected];
      if (item && !item.separator) {
        this.command(item);
      }
      return true;
    }
    if (e.key === "ArrowUp") {
      const prev = this.selected - 1;
      const index =
        this.items[prev] && this.items[prev].separator ? prev - 1 : prev;
      this.selected = index < 0 ? this.items.length - 1 : index;
      this.render();
      return true;
    }
    if (e.key === "ArrowDown") {
      const next = this.selected + 1;
      const index =
        this.items[next] && this.items[next].separator ? next + 1 : next;
      this.selected = index >= this.items.length ? 0 : index;
      this.render();
      return true;
    }
    return false;
  }

  public destroy() {
    this.popup.destroy();
  }
}
