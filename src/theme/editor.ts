import { css } from "@emotion/css";

export const editorCss = css`
  color: var(--tiptap-color-text);
  background-color: var(--tiptap-color-background);
  font-family: var(--tiptap-font-family);
  font-weight: var(--tiptap-font-weight);
  font-size: var(--tiptap-font-size);
  line-height: var(--tiptap-line-height);
  width: 100%;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: break-spaces;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0;
  }

  pre {
    white-space: pre-wrap;
  }

  li {
    position: relative;
  }

  .ProseMirror-hideselection *::selection {
    background: transparent;
  }

  .ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }

  .ProseMirror-hideselection {
    caret-color: transparent;
  }

  .ProseMirror-selectednode {
    outline: 2px solid var(--tiptap-color-selected);
  }

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode::after {
    content: "";
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid var(--tiptap-color-selected);
    pointer-events: none;
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;

    &::after {
      content: "";
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid black;
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden;
    }
  }

  .placeholder::before {
    display: block;
    opacity: 0;
    transition: opacity 150ms ease-in-out;
    content: attr(data-empty-text);
    pointer-events: none;
    height: 0;
    color: var(--tiptap-color-text-secondly);
  }

  .ProseMirror-focused {
    .ProseMirror-gapcursor {
      display: block;
    }

    .placeholder::before {
      opacity: 1;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1em 0 0.5em;
    font-weight: 500;
    cursor: text;

    &::before {
      display: inline-block;
      font-family: var(--tiptap-font-family-mono);
      color: var(--tiptap-color-text-secondly);
      font-size: 13px;
      line-height: 0;
      margin-left: -24px;
      width: 24px;
    }
  }

  h1::before {
    content: "H1";
  }

  h2::before {
    content: "H2";
  }

  h3::before {
    content: "H3";
  }

  h4::before {
    content: "H4";
  }

  h5::before {
    content: "H5";
  }

  h6::before {
    content: "H6";
  }

  blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    font-style: italic;
    overflow: hidden;
    position: relative;

    &::before {
      content: "";
      display: inline-block;
      width: 3px;
      border-radius: 1px;
      position: absolute;
      margin-left: -1em;
      top: 0;
      bottom: 0;
      background: var(--tiptap-color-primary);
    }
  }

  b,
  strong {
    font-weight: 600;
  }

  p {
    margin: 0;
  }

  a {
    color: var(--tiptap-color-primary);
    cursor: pointer;
  }

  ul,
  ol {
    margin: 0;
    padding: 0 0 0 1.2em;
  }

  ol {
    ol {
      list-style: lower-alpha;

      ol {
        list-style: lower-roman;
      }
    }
  }

  ul[data-type="taskList"] {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;

      label {
        padding-right: 0.5em;
        padding-top: 0.09em;

        input {
          width: 1em;
          height: 1em;
        }
      }
    }
  }

  hr {
    position: relative;
    height: 1em;
    border: 0;

    &::before {
      content: "";
      display: block;
      position: absolute;
      border-top: 1px solid var(--tiptap-color-border);
      top: 0.5em;
      left: 0;
      right: 0;
    }
  }

  code {
    border-radius: 0.25em;
    padding: 0.2em 0.25em;
    font-family: var(--tiptap-font-family-mono);
    font-size: 85%;
    color: var(--tiptap-color-code);
    background: var(--tiptap-color-background-secondly);
    tab-size: 4;
  }

  mark {
    background-color: var(--tiptap-color-mark);
  }

  img {
    max-width: 100%;
  }

  img.ProseMirror-separator {
    display: inline !important;
    border: none !important;
    margin: 0 !important;
    width: 1px !important;
    height: 1px !important;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 1em;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    tr {
      position: relative;
      border-bottom: 1px solid var(--tiptap-color-border);
    }

    th {
      background: var(--tiptap-color-background-secondly);
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid var(--tiptap-color-border);
      padding: 0.25em 0.5em;
      min-width: 100px;
    }

    .selectedCell {
      background: var(--tiptap-color-background-hover);
      background-clip: padding-box;
    }

    .grip-column {
      &::after {
        content: "";
        position: absolute;
        display: block;
        width: 100%;
        height: 0.7em;
        left: 0;
        top: -1em;
        margin-bottom: 3px;
        cursor: pointer;
        background: var(--tiptap-color-border);
      }

      &:hover::after {
        background: var(--tiptap-color-background-hover);
      }

      &.selected::after {
        background: var(--tiptap-color-selected);
      }
    }

    .grip-row {
      &::after {
        content: "";
        position: absolute;
        display: block;
        height: 100%;
        width: 0.7em;
        top: 0;
        left: -1em;
        margin-right: 3px;
        cursor: pointer;
        background: var(--tiptap-color-border);
      }

      &:hover::after {
        background: var(--tiptap-color-background-hover);
      }

      &.selected::after {
        background: var(--tiptap-color-selected);
      }
    }

    .grip-table {
      &::after {
        content: "";
        position: absolute;
        display: block;
        width: 0.8em;
        height: 0.8em;
        top: -1em;
        left: -1em;
        border-radius: 50%;
        cursor: pointer;
        background: var(--tiptap-color-border);
      }

      &:hover::after {
        background: var(--tiptap-color-background-hover);
      }

      &.selected::after {
        background: var(--tiptap-color-selected);
      }
    }
  }

  details {
    border-radius: 4px;
    padding: 0.5em 1em;
    background: var(--tiptap-color-background-secondly);
    border: 1px solid var(--tiptap-color-border);
  }

  iframe {
    width: 100%;
    border: 0;
    min-height: 50vh;
  }

  .ProseMirror[contenteditable="false"] {
    .ProseMirror-selectednode {
      outline: 2px solid transparent;
    }

    .placeholder::before {
      display: none;
    }

    table {
      .grip-column,
      .grip-row,
      .grip-table {
        display: none;
      }
    }
  }
`;
