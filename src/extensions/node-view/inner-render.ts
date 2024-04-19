import { Editor, NodeViewRendererProps, mergeAttributes } from "@tiptap/core";
import { NodeView } from "@tiptap/pm/view";
import { Node } from "@tiptap/pm/model";

export interface InnerRenderViewOptions extends NodeViewRendererProps {
  id?: string;
  tag?: keyof HTMLElementTagNameMap;
  class?: string | string[];
  style?: Partial<CSSStyleDeclaration> | Array<Partial<CSSStyleDeclaration>>;
  onRender?: (props: { view: InnerRenderView; editor: Editor; $root: HTMLElement }) => void;
  onInit?: (props: { view: InnerRenderView; editor: Editor; $root: HTMLElement }) => void;
  onUpdate?: (props: { view: InnerRenderView; editor: Editor; $root: HTMLElement }) => void;
  onDestroy?: (props: { view: InnerRenderView; editor: Editor; $root: HTMLElement }) => void;
}

export class InnerRenderView implements NodeView {
  private readonly editor: Editor;
  private readonly options: InnerRenderViewOptions;

  private _node: Node;
  private _root: HTMLElement;

  public static create(options: Partial<Omit<InnerRenderViewOptions, keyof Omit<NodeViewRendererProps, "HTMLAttributes">>>) {
    return (_options: NodeViewRendererProps) => new InnerRenderView({
      ...options,
      ..._options,
      HTMLAttributes: {
        ...options.HTMLAttributes,
        ..._options.HTMLAttributes,
      },
    });
  }

  constructor(options: InnerRenderViewOptions) {
    this.editor = options.editor;
    this.options = options;
    this._node = options.node;
    this._root = document.createElement(options.tag ?? "div");
    this._root.classList.add("ProseMirror-inner-render");
    this._root.setAttribute("data-type", this._node.type.name);
    if (this.options.id) {
      this._root.setAttribute("name", this.options.id);
    }
    if (this.options.class) {
      for (const item of Array.isArray(this.options.class) ? this.options.class : [this.options.class]) {
        this._root.classList.add(item);
      }
    }
    if (this.options.style) {
      for (const item of Array.isArray(this.options.style) ? this.options.style : [this.options.style]) {
        for (const [key, val] of Object.entries(item)) {
          // @ts-expect-error
          this._root.style[key] = val;
        }
      }
    }
    for (const [key, value] of Object.entries(mergeAttributes(this.options.HTMLAttributes))) {
      if (value !== undefined && value !== null) {
        this._root.setAttribute(key, value);
      }
    }
    if (this.options.onInit) {
      this.options.onInit({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    if (this.options.onRender) {
      this.options.onRender({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
  }

  public get dom() {
    return this._root;
  }

  public get node() {
    return this._node;
  }

  public get getPos() {
    return this.options.getPos;
  }

  public get HTMLAttributes() {
    return this.options.HTMLAttributes;
  }

  public get $root() {
    return this._root;
  }

  public update(node: Node) {
    if (node.type !== this.options.node.type) {
      return false;
    }
    this._node = node;
    if (this.options.onUpdate) {
      this.options.onUpdate({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    if (this.options.onRender) {
      this.options.onRender({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    return true;
  }

  public destroy() {
    if (this.options.onDestroy) {
      this.options.onDestroy({
        view: this,
        editor: this.editor,
        $root: this._root,
      });
    }
    this.$root.remove();
  }
}
