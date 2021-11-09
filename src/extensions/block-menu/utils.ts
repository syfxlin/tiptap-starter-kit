import { css } from "@emotion/css";

export type CommandViewProps = {
  name: string;
  icon: (() => HTMLElement) | HTMLElement | string;
  shortcut?: string;
};

export const commandView = (props: CommandViewProps) => (dom: HTMLElement) => {
  // icon
  const icon = document.createElement("div");
  icon.classList.add(css`
    margin-right: 1em;
    width: 1.2em;
    height: 1.2em;

    svg {
      width: 1.2em;
      height: 1.2em;
    }
  `);
  if (typeof props.icon === "string") {
    icon.innerHTML = props.icon;
  } else {
    icon.append(typeof props.icon === "function" ? props.icon() : props.icon);
  }
  dom.append(icon);
  // name
  const name = document.createElement("div");
  name.classList.add(css`
    flex-grow: 1;
    text-align: start;
  `);
  name.textContent = props.name;
  dom.append(name);
  // shortcut
  props.shortcut?.split(" ").forEach((key, index) => {
    if (index !== 0) {
      const span = document.createElement("span");
      span.textContent = "+";
      dom.append(span);
    }
    const kbd = document.createElement("kbd");
    kbd.classList.add(css`
      font-family: var(--tiptap-font-family-mono);
      font-size: 0.6em;
      font-weight: 700;
      background-color: var(--tiptap-color-background-secondly);
      color: var(--tiptap-color-text);
      padding: 0.3em 0.5em;
      border-radius: 4px;
      border-width: 1px 1px 3px;
      border-style: solid;
      border-color: var(--tiptap-color-border);
    `);
    kbd.textContent = key;
    dom.append(kbd);
  });
};
