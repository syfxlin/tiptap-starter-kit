import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ClickMenuView } from "./view";

export interface ClickMenuOptions {
}

export const ClickMenu = Extension.create<ClickMenuOptions>({
  name: "clickMenu",
  addProseMirrorPlugins() {
    const view = new ClickMenuView({ editor: this.editor });
    return [
      new Plugin({
        key: new PluginKey("click-menu"),
        props: {
          handleDOMEvents: {
            drop: (_view, event) => view.drop(event),
            keydown: (_view, event) => view.keydown(event),
            dragover: (_view, event) => view.dragover(event),
            dragleave: (_view, event) => view.dragleave(event),
            dragenter: (_view, event) => view.dragenter(event),
            mousemove: (_view, event) => view.mousemove(event),
          },
        },
      }),
    ];
  },
});
