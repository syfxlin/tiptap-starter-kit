import { Editor } from "@tiptap/core";
import { Node, ResolvedPos } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import { EditorProps } from "@tiptap/pm/view";
import tippy, { Instance, PopperElement, Props } from "tippy.js";
import { icon } from "../../utils/icons";
import { serializeForClipboard } from "../../utils/serialize";

export interface ClickMenuViewOptions {
  editor: Editor;
  tippy?: Partial<Props>;
  onMenu?: (props: { editor: Editor; view: ClickMenuView; root: PopperElement; active: ClickMenuActiveOptions; selection: NodeSelection }) => void;
  onInit?: (props: { editor: Editor; view: ClickMenuView; root: HTMLElement }) => void;
  onMount?: (props: { editor: Editor; view: ClickMenuView; root: HTMLElement }) => void;
  onDestroy?: (props: { editor: Editor; view: ClickMenuView; root: HTMLElement }) => void;
  classes?: Array<string>;
  attributes?: Record<string, string>;
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

  private _menu: Instance | undefined;
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

  public hide(mode?: "button" | "menu" | "both") {
    if (mode !== "menu") {
      this.popover.hide();
    }
    if (mode !== "button" && this._menu) {
      this._menu.destroy();
    }
  }

  public destroy() {
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        root: this.element,
        editor: this.editor,
      });
    }
    this.popover.destroy();
    this.element.remove();
  }

  public events(): EditorProps["handleDOMEvents"] {
    return {
      drop: () => {
        this._dragging = false;
      },
      keydown: () => {
        this.hide();
      },
      dragenter: () => {
        this._dragging = true;
      },
      dragleave: () => {
        this._dragging = false;
      },
      dragover: (_view, event) => {
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
      },
      mousemove: (_view, event) => {
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
            this.hide("button");
          }
        }, 8);
        return false;
      },
    };
  }

  private _element() {
    const element = document.createElement("div");
    element.classList.add("ProseMirror-cm");
    for (const clazz of this.options.classes ?? []) {
      element.classList.add(clazz);
    }
    for (const [key, val] of Object.entries(this.options.attributes ?? {})) {
      element.setAttribute(key, val);
    }

    const plus = document.createElement("div");
    plus.innerHTML = icon("plus");
    plus.classList.add("ProseMirror-cm-plus");
    plus.addEventListener("click", () => {
      if (this._active) {
        const { pos, node } = this._active;
        this.editor.chain()
          .insertContentAt(pos.pos + node.nodeSize, { type: "paragraph" })
          .setTextSelection(pos.pos + node.nodeSize)
          .focus()
          .run();
      }
    });

    const drag = document.createElement("div");
    drag.innerHTML = icon("drag");
    drag.classList.add("ProseMirror-cm-drag");
    drag.draggable = true;
    drag.addEventListener("mouseup", () => {
      if (!this._dragging) {
        requestAnimationFrame(() => {
          this.editor.view.focus();
        });
        return;
      }
      this._dragging = false;
      this._selection = undefined;
    });
    drag.addEventListener("mousedown", () => {
      const { state, view } = this.editor;
      const active = this._active;
      if (active && NodeSelection.isSelectable(active.node)) {
        const selection = NodeSelection.create(state.doc, active.pos.pos - (active.node.isLeaf ? 0 : 1));
        view.dispatch(state.tr.setSelection(selection));
        view.focus();
        this._selection = selection;
      }
    });
    drag.addEventListener("dragstart", (e) => {
      this._dragging = true;
      const view = this.editor.view;
      const selection = this._selection;
      if (e.dataTransfer && selection) {
        const slice = selection.content();
        view.dragging = { slice, move: true };
        const { dom, text } = serializeForClipboard(view, slice);
        e.dataTransfer.effectAllowed = "copyMove";
        e.dataTransfer.clearData();
        e.dataTransfer.setData("text/html", dom.innerHTML);
        e.dataTransfer.setData("text/plain", text);
      }
    });
    drag.addEventListener("click", () => {
      if (this._menu) {
        this._menu.destroy();
      }
      if (!this._active || !this._selection || this._dragging || !this.options.onMenu) {
        return;
      }
      const root = document.createElement("div");
      root.classList.add("ProseMirror-cm-menu");
      this.options.onMenu({
        root,
        view: this,
        editor: this.editor,
        active: this._active,
        selection: this._selection,
      });
      this._menu = tippy(document.body, {
        appendTo: () => document.body,
        getReferenceClientRect: () => this._active!.dom.getBoundingClientRect(),
        content: root,
        arrow: false,
        interactive: true,
        showOnCreate: true,
        theme: "ProseMirror",
        animation: "shift-away",
        trigger: "manual",
        placement: "left-start",
        maxWidth: "none",
        offset: [0, 35],
        zIndex: 999,
      });
    });

    element.append(plus);
    element.append(drag);
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        root: element,
        editor: this.editor,
      });
    }
    return element;
  }

  private _popover() {
    return tippy(document.body, {
      appendTo: () => document.body,
      getReferenceClientRect: null,
      content: this.element,
      arrow: false,
      interactive: true,
      hideOnClick: false,
      theme: "ProseMirror-none",
      animation: "shift-away",
      trigger: "manual",
      placement: "left-start",
      maxWidth: "none",
      offset: [0, 10],
      zIndex: 998,
      ...this.options.tippy,
      onMount: (i) => {
        if (this.options.tippy?.onMount) {
          this.options.tippy.onMount(i);
        }
        if (this.element && this.options.onMount) {
          this.options.onMount({
            view: this,
            root: this.element,
            editor: this.editor,
          });
        }
      },
    });
  }

  private _find(event: HTMLElementEventMap["mousemove"]) {
    const { view } = this.editor;

    if (view.composing || !view.editable || !event.target || !view.dom.parentElement) {
      return undefined;
    }

    let pos = 0;
    let node = document.elementFromPoint(event.x + 70, event.y);
    if (!node || node === view.dom) {
      node = event.target as Element | null;
    }
    if (!node || node === view.dom) {
      node = document.elementFromPoint(event.x, event.y);
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
    if (!parent || parent.type.name === "doc" || parent.type.name === "detailsContent") {
      return false;
    }
    return parent.firstChild === node;
  }
}
