import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ClickMenuView } from "./view";

export interface ClickMenuItemStorage {
  clickMenu: {
    hide?: boolean;
    items: Array<unknown>;
  };
}

export interface ClickMenuOptions {
}

export const ClickMenu = Extension.create<ClickMenuOptions>({
  name: "clickMenu",
  addProseMirrorPlugins() {
    const view = new ClickMenuView({ editor: this.editor });
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-click-menu`),
        view: () => ({ destroy: () => view.destroy() }),
        props: {
          handleDOMEvents: {
            drop: (_view, event) => view.drop(event),
            keydown: (_view, event) => view.keydown(event),
            dragover: (_view, event) => view.dragover(event),
            dragenter: (_view, event) => view.dragenter(event),
            dragleave: (_view, event) => view.dragleave(event),
            mousemove: (_view, event) => view.mousemove(event),
          },
        },
      }),
    ];
  },
});
