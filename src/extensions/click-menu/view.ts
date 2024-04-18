import tippy, { Instance, Props } from "tippy.js";
import { Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { Node, ResolvedPos } from "@tiptap/pm/model";
import { serializeForClipboard } from "../../utils/serialize";
import { icon } from "../../utils/icons";

export interface ClickMenuViewOptions {
  editor: Editor;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  tippy?: (props: { view: ClickMenuView; editor: Editor; options: Partial<Props> }) => Partial<Props>;
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
  private _dragging: boolean | undefined;
  private _selection: NodeSelection | undefined;

  constructor(options: ClickMenuViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this.element = this._element();
    this.popover = this._popover();
  }

  public show(active: ClickMenuActiveOptions) {
    if (active.node.type.name === "listItem") {
      this.popover.setProps({ getReferenceClientRect: () => active.dom.getBoundingClientRect(), offset: [0, 30] });
    } else {
      this.popover.setProps({ getReferenceClientRect: () => active.dom.getBoundingClientRect(), offset: [0, 10] });
    }
    if (this._active?.dom !== active.dom) {
      this.popover.hide();
    }
    this._active = active;
    this.popover.show();
  }

  public hide() {
    this.popover.hide();
  }

  public keydown(_event: HTMLElementEventMap["keydown"]) {
    this.hide();
  }

  public drop(_event: HTMLElementEventMap["drop"]) {
    this._dragging = false;
  }

  public dragstart(event: HTMLElementEventMap["dragstart"]) {
    this._dragging = true;
    const view = this.editor.view;
    const selection = this._selection;
    if (event.dataTransfer && selection) {
      const slice = selection.content();
      view.dragging = { slice, move: true };
      const { dom, text } = serializeForClipboard(view, slice);
      event.dataTransfer.effectAllowed = "copyMove";
      event.dataTransfer.clearData();
      event.dataTransfer.setData("text/html", dom.innerHTML);
      event.dataTransfer.setData("text/plain", text);
    }
  }

  public dragover(event: HTMLElementEventMap["dragover"]) {
    if (this._dragging) {
      const view = this.editor.view;
      const root = view.dom.parentElement;

      if (!root) {
        return;
      }

      const rect = root.getBoundingClientRect();

      if (root.scrollHeight > root.clientHeight) {
        if (root.scrollTop > 0 && Math.abs(event.y - rect.y) < 20) {
          root.scrollTop = root.scrollTop > 10 ? root.scrollTop - 10 : 0;
          return;
        }
        if (Math.round(root.scrollTop + rect.height) < Math.round(view.dom.getBoundingClientRect().height) && Math.abs(event.y - (rect.height + rect.y)) < 20) {
          root.scrollTop = root.scrollTop + 10;
        }
      }
    }
  }

  public dragenter(_event: HTMLElementEventMap["dragenter"]) {
    this._dragging = true;
  }

  public dragleave(_event: HTMLElementEventMap["dragleave"]) {
    this._dragging = false;
  }

  public mouseup(_event: HTMLElementEventMap["mouseup"]) {
    if (!this._dragging) {
      requestAnimationFrame(() => {
        this.editor.view.focus();
      });
      return;
    }
    this._dragging = false;
    this._selection = undefined;
  }

  public mousedown(_event: HTMLElementEventMap["mousedown"]) {
    const { state, view } = this.editor;
    const active = this._active;
    if (active && NodeSelection.isSelectable(active.node)) {
      const selection = NodeSelection.create(state.doc, active.pos.pos - (active.node.isLeaf ? 0 : 1));
      view.dispatch(state.tr.setSelection(selection));
      view.focus();
      this._selection = selection;
    }
  }

  public mousemove(event: HTMLElementEventMap["mousemove"]) {
    const { view } = this.editor;
    if (view.composing || !view.editable || !event.target) {
      return false;
    }
    clearTimeout(this._timer);
    // @ts-expect-error
    this._timer = setTimeout(() => {
      const active = this._find(event);
      if (active) {
        this.show(active);
      } else {
        this.hide();
      }
    }, 8);
    return false;
  }

  public plus() {
    if (this._active) {
      const { pos, node } = this._active;
      this.editor.chain()
        .insertContentAt(pos.pos + node.nodeSize, { type: "paragraph" })
        .setTextSelection(pos.pos + node.nodeSize)
        .focus()
        .run();
    }
  }

  public destroy() {
    this.popover.destroy();
    this.element.remove();
  }

  private _element() {
    const element = document.createElement("div");
    element.classList.add("ProseMirror-cm");
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
    const plus = document.createElement("div");
    plus.innerHTML = icon("plus");
    plus.classList.add("ProseMirror-cm-plus");
    plus.addEventListener("click", this.plus.bind(this));
    const drag = document.createElement("div");
    drag.innerHTML = icon("drag");
    drag.classList.add("ProseMirror-cm-drag");
    drag.draggable = true;
    drag.addEventListener("mouseup", this.mouseup.bind(this));
    drag.addEventListener("mousedown", this.mousedown.bind(this));
    drag.addEventListener("dragstart", this.dragstart.bind(this));
    element.append(plus);
    element.append(drag);
    return element;
  }

  private _popover() {
    const options: Partial<Props> = {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      theme: "ProseMirror-none",
      animation: "shift-away",
      trigger: "manual",
      placement: "left-start",
      maxWidth: "none",
      offset: [0, 10],
      zIndex: 998,
    };
    return tippy(document.body, this.options.tippy ? this.options.tippy({ options, view: this, editor: this.editor }) : options);
  }

  private _find(event: HTMLElementEventMap["mousemove"]) {
    const { view } = this.editor;
    if (view.composing || !view.editable || !event.target || !view.dom.parentElement) {
      return undefined;
    }

    let pos = 0;
    let node = event.target as Element | null;
    if (node === view.dom) {
      node = document.elementFromPoint(event.x + 70, event.y);
    }
    if (node) {
      pos = view.posAtDOM(node, 0);
    }
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

    while (_node && (this._nodeIsNotBlock(_node) || this._nodeIsDisabled(_node) || this._nodeIsFirstChild(_pos))) {
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

  private _nodeIsDisabled(node: Node) {
    return this.editor.storage[node.type.name]?.clickMenu?.hide;
  }

  private _nodeIsNotBlock(node: Node) {
    return !node.type.isBlock || node.type.name === "doc";
  }

  private _nodeIsFirstChild(pos: ResolvedPos) {
    let parent = pos.parent;
    const node = pos.node();
    if (parent === node) {
      parent = pos.node(pos.depth - 1);
    }
    if (!parent || parent.type.name === "doc") {
      return false;
    }
    return parent.firstChild === node;
  }
}
