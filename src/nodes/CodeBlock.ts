import arduino from "highlight.js/lib/languages/arduino";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import cssHljs from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import less from "highlight.js/lib/languages/less";
import lua from "highlight.js/lib/languages/lua";
import makefile from "highlight.js/lib/languages/makefile";
import markdown from "highlight.js/lib/languages/markdown";
import objectivec from "highlight.js/lib/languages/objectivec";
import perl from "highlight.js/lib/languages/perl";
import php from "highlight.js/lib/languages/php";
import phpTemplate from "highlight.js/lib/languages/php-template";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import pythonRepl from "highlight.js/lib/languages/python-repl";
import r from "highlight.js/lib/languages/r";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import scss from "highlight.js/lib/languages/scss";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";
import vbnet from "highlight.js/lib/languages/vbnet";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import lowlight from "lowlight/lib/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { css } from "@emotion/css";
import { NodeMarkdownStorage } from "../extensions/markdown/Markdown";

const languages = {
  arduino: arduino,
  bash: bash,
  sh: bash,
  c: c,
  cpp: cpp,
  csharp: csharp,
  css: cssHljs,
  diff: diff,
  patch: diff,
  go: go,
  ini: ini,
  toml: ini,
  java: java,
  javascript: javascript,
  json: json,
  kotlin: kotlin,
  less: less,
  lua: lua,
  makefile: makefile,
  markdown: markdown,
  objc: objectivec,
  perl: perl,
  php: php,
  "php-template": phpTemplate,
  text: plaintext,
  python: python,
  "python-repl": pythonRepl,
  r: r,
  ruby: ruby,
  rust: rust,
  scss: scss,
  shell: shell,
  sql: sql,
  swift: swift,
  typescript: typescript,
  vb: vbnet,
  xml: xml,
  html: xml,
  plist: xml,
  svg: xml,
  yml: yaml,
};

Object.entries(languages).forEach(([name, lib]) =>
  lowlight.registerLanguage(name, lib)
);

const preCss = css`
  position: relative;
  color: var(--tiptap-color-text-secondly);
  background-color: var(--tiptap-color-background-secondly);
  display: block;
  overflow-x: auto;
  padding: 0.75em 1em;
  line-height: 1.5;
  border-radius: 4px;
  border: 1px solid var(--tiptap-color-border);
  white-space: pre;

  code {
    background: none !important;
    padding: 0 !important;
    border: 0 !important;
  }

  select {
    position: absolute;
    top: 0.25em;
    right: 0.25em;
    border-width: 1px;
    font-size: 0.8em;
    display: none;
    padding: 0.125em;
    border-radius: 4px;
    background-color: var(--tiptap-color-background);

    &:focus,
    &:active {
      display: inline;
    }
  }

  &:hover select {
    display: inline;
  }

  .hljs-comment,
  .hljs-quote {
    color: #a0a1a7;
    font-style: italic;
  }

  .hljs-doctag,
  .hljs-keyword,
  .hljs-formula {
    color: #a626a4;
  }

  .hljs-section,
  .hljs-name,
  .hljs-selector-tag,
  .hljs-deletion,
  .hljs-subst {
    color: #e45649;
  }

  .hljs-literal {
    color: #0184bb;
  }

  .hljs-string,
  .hljs-regexp,
  .hljs-addition,
  .hljs-attribute,
  .hljs-meta .hljs-string {
    color: #50a14f;
  }

  .hljs-attr,
  .hljs-variable,
  .hljs-template-variable,
  .hljs-type,
  .hljs-selector-class,
  .hljs-selector-attr,
  .hljs-selector-pseudo,
  .hljs-number {
    color: #986801;
  }

  .hljs-symbol,
  .hljs-bullet,
  .hljs-link,
  .hljs-meta,
  .hljs-selector-id,
  .hljs-title {
    color: #4078f2;
  }

  .hljs-built_in,
  .hljs-title.class_,
  .hljs-class .hljs-title {
    color: #c18401;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: bold;
  }

  .hljs-link {
    text-decoration: underline;
  }
`;

export const CodeBlock = CodeBlockLowlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight,
      defaultLanguage: "javascript",
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("pre");
      const content = document.createElement("code");
      dom.classList.add(preCss);

      const toolbar = document.createElement("div");
      const select = document.createElement("select");

      // language list
      Object.keys(languages).forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.append(option);
      });

      // set language
      select.value = node.attrs.language;
      select.addEventListener("change", () => {
        if (!editor.isEditable) {
          select.value = node.attrs.language;
        } else if (typeof getPos === "function") {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
              ...node.attrs,
              language: select.value,
            })
          );
        }
      });

      toolbar.append(select);
      dom.append(toolbar);
      dom.append(content);
      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          select.value = updatedNode.attrs.language;
          return true;
        },
      };
    };
  },
  addStorage() {
    return {
      ...this.parent?.(),
      parser: {
        match: (node) => node.type === "code",
        runner: (state, node, type) => {
          const language = node.lang as string;
          const value = node.value as string;
          state.openNode(type, { language }).addText(value).closeNode();
        },
      },
      serializer: {
        match: (node) => node.type.name === this.name,
        runner: (state, node) => {
          state.addNode({
            type: "code",
            value: node.content.firstChild?.text || "",
            lang: node.attrs.language,
          });
        },
      },
    } as NodeMarkdownStorage;
  },
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive(this.name)) {
          this.editor.commands.insertContent("\t");
          return true;
        }
        return false;
      },
    };
  },
});
