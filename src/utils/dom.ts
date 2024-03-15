export function popoverAppendTo() {
  let popover = document.body.querySelector(".tiptap-popover");
  if (!popover) {
    popover = document.createElement("div");
    popover.classList.add("tiptap");
    popover.classList.add("tiptap-popover");
    document.body.append(popover);
  }
  return popover;
}
