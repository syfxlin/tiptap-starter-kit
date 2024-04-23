import { Editor } from "@tiptap/core";
import { StarterKit } from "../src";
import "../src/styles.less";

const editor = new Editor({
  element: document.querySelector("#editor")!,
  extensions: [StarterKit],
  content: `
    aaa <a href="https://ixk.me">Blog</a> <span data-type="mathInline">E = mc^2</span>
    <details>
      <summary>123</summary>
      456
    </details>
    <iframe src="https://ixk.me" height="1000px"></iframe>
    <pre language="javascript"><code>console.log("123");</code></pre>
    aaa <a href="https://ixk.me">Blog</a>
    <img src="https://source.unsplash.com/random" alt="Unsplash">
    <img src="">
    <img src="https://ixk.me/bg.jpg">
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th colspan="3">Description</th>
        </tr>
        <tr>
          <td>Cyndi Lauper</td>
          <td>singer</td>
          <td>songwriter</td>
          <td>actress</td>
        </tr>
      </tbody>
    </table>
  `,
});

// @ts-expect-error
window.editor = editor;
document.querySelector("#editable")?.addEventListener("click", () => {
  const value = document.querySelector("#editable span")!;
  const editable = value.textContent === "true";
  value.textContent = !editable ? "true" : "false";
  editor.setEditable(!editable);
});
