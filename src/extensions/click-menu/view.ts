import tippy, { Instance, Props } from "tippy.js";
import { Editor } from "@tiptap/core";
import { Node, ResolvedPos } from "@tiptap/pm/model";
import { EditorView } from "@tiptap/pm/view";

export interface ClickMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: CSSStyleDeclaration | CSSStyleDeclaration[];
  tippy?: (props: { view: ClickMenuView; editor: Editor; options: Partial<Props> }) => Partial<Props>;
  onInit?: (props: { view: ClickMenuView; editor: Editor; element: HTMLElement }) => void;
  onUpdate?: (props: { view: ClickMenuView; editor: Editor; element: HTMLElement }) => void;
  onDestroy?: (props: { view: ClickMenuView; editor: Editor; element: HTMLElement }) => void;
}

export interface ClickMenuActiveOptions {
  node: Node;
  pos: ResolvedPos;
  dom: HTMLElement;
}

export class ClickMenuView {
  private readonly editor: Editor;
  private readonly popover: Instance;
  private readonly element: HTMLElement;
  private readonly options: ClickMenuViewOptions;

  private _timer: number | undefined;
  private _active: ClickMenuActiveOptions | undefined;

  constructor(options: ClickMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this.element = this._element();
    this.popover = this._popover();
  }

  public show(active: ClickMenuActiveOptions) {
    this._active = active;
    this.popover.setProps({ getReferenceClientRect: () => active.dom.getBoundingClientRect() });
    this.popover.show();
  }

  public hide() {
    this.popover.hide();
  }

  public drop(event: HTMLElementEventMap["drop"]) {}

  public keydown(event: HTMLElementEventMap["keydown"]) {}

  public dragover(event: HTMLElementEventMap["dragover"]) {}

  public dragleave(event: HTMLElementEventMap["dragleave"]) {}

  public dragenter(event: HTMLElementEventMap["dragenter"]) {}

  public mousemove(event: HTMLElementEventMap["mousemove"]) {
    const { view } = this.editor;
    if (view.composing || !view.editable || !event.target) {
      return false;
    }
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      const active = this._select(event.target as HTMLElement, view);
      if (active) {
        this.show(active);
      } else {
        this.hide();
      }
    }, 16);
    return false;
  }

  private _element() {
    const element = document.createElement("div");
    element.classList.add("ProseMirror-cm");
    element.textContent = "click menu";
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
      placement: "left-start",
      maxWidth: "none",
    };
    return tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
  }

  private _select(target: HTMLElement, view: EditorView) {
    if (view.composing || !view.editable || !target || !view.dom.parentElement || target === view.dom) {
      return undefined;
    }

    const pos = view.posAtDOM(target, 0);
    if (pos <= 0) {
      return undefined;
    }

    let _pos = view.state.doc.resolve(pos);
    let _node = _pos.node();

    if (_node.type.name === "doc") {
      const node = view.state.doc.nodeAt(pos);
      if (!node) {
        return undefined;
      }
      _node = node;
    }

    while (_node && (this._nodeIsNotBlock(_node) || this._nodeIsFirstChild(_pos))) {
      _pos = view.state.doc.resolve(_pos.before());
      _node = _pos.node();
    }

    _pos = _pos.pos - _pos.parentOffset === 0 ? _pos : view.state.doc.resolve(_pos.pos - _pos.parentOffset);

    let _dom = view.nodeDOM(_pos.pos) as HTMLElement | undefined;
    if (!_dom) {
      _dom = view.nodeDOM(_pos.pos - 1) as HTMLElement | undefined;
    }

    while (_dom?.parentElement && _dom.parentElement !== view.dom.parentElement && _pos.pos === view.posAtDOM(_dom.parentElement, 0)) {
      _dom = _dom.parentElement;
    }

    if (!_dom) {
      return undefined;
    }

    return { node: _node, pos: _pos, dom: _dom };
  }

  private _nodeIsNotBlock(node: Node) {
    return !node.type.isBlock;
  }

  private _nodeIsFirstChild(pos: ResolvedPos) {
    let parent = pos.parent;
    const target = pos.node();
    if (parent === target) {
      parent = pos.node(pos.depth - 1);
    }
    if (!parent || parent.type.name === "doc") {
      return false;
    }
    return parent.firstChild === target;
  }
}
