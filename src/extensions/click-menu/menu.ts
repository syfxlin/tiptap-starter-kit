import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ClickMenuView } from "./view";

export interface ClickMenuItemStorage {
  clickMenu: {
    hide?: boolean;
    items?: Array<unknown>;
  };
}

export interface ClickMenuOptions {
}

export const ClickMenu = Extension.create<ClickMenuOptions>({
  name: "clickMenu",
  addProseMirrorPlugins() {
    const view = new ClickMenuView({
      editor: this.editor,
      // onMenu: ({ root }) => {
      //   root.innerHTML = "123";
      // },
    });
    return [
      new Plugin({
        key: new PluginKey(`${this.name}-click-menu`),
        view: () => ({ destroy: () => view.destroy() }),
        props: { handleDOMEvents: view.events() },
      }),
    ];
  },
});
