import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { editorCss } from "./theme/editor";
import { css, injectGlobal } from "@emotion/css";
import { Emoji } from "./nodes/Emoji";
import { MathInline } from "./nodes/MathInline";
import { MathBlock } from "./nodes/MathBlock";
import { Diagram } from "./nodes/Diagram";
import { Audio } from "./nodes/Audio";
import { Video } from "./nodes/Video";
import { Details } from "./nodes/Details";
import { Embed } from "./nodes/Embed";
import { StarterKit } from "./extensions/starter-kit/StarterKit";

injectGlobal`
  :root {
    --tiptap-color-text: #000;
    --tiptap-color-text-secondly: #adb5bd;
    --tiptap-color-background: #fff;
    --tiptap-color-background-hover: #e9ecef;
    --tiptap-color-background-secondly: #f8f9fa;
    --tiptap-color-border: #ced4da;
    --tiptap-color-reverse-text: #fff;
    --tiptap-color-reverse-text-secondly: #f8f9fa;
    --tiptap-color-reverse-background: #25262b;
    --tiptap-color-reverse-bakcground-secondly: #5c5f66;
    --tiptap-color-primary: #1c7ed6;
    --tiptap-color-selected: #8cf;
    --tiptap-color-code: #c92a2a;
    --tiptap-color-mark: #ffec99;
    --tiptap-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --tiptap-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
    --tiptap-font-weight: 400;
    --tiptap-font-size: 1em;
    --tiptap-line-height: 1.7;
  }
`;

const App: React.FC = () => {
  const [editable, setEditable] = useState(true);
  const editor = useEditor({
    editable: true,
    extensions: [
      // own
      Emoji,
      MathInline,
      MathBlock,
      Diagram,
      Audio,
      Video,
      Details,
      Embed,
      //
      StarterKit,
    ],
    content: `<p>Hello World!</p><p><audio controls="true" src="https://lab.ixk.me/assets/media/Summer.mp3"></audio></p><p></p><iframe src="https://ixk.me"></iframe><pre><code class="language-javascript">for (var i=1; i &lt;= 20; i++)\n{\n  if (i % 15 == 0)\n    console.log("FizzBuzz");\n  else if (i % 3 == 0)\n    console.log("Fizz");\n  else if (i % 5 == 0)\n    console.log("Buzz");\n  else\n    console.log(i);\n}</code></pre>`,
  });
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);
  return (
    <div
      className={css`
        width: 80%;
        margin: auto;
      `}
    >
      <h1>Title</h1>
      <div>
        <button onClick={() => setEditable(!editable)}>
          Set Editable: {editable ? "true" : "false"}
        </button>
      </div>
      <EditorContent editor={editor} className={editorCss} />
    </div>
  );
};

export default App;
