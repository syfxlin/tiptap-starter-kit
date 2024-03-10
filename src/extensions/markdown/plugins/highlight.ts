import { u } from "unist-builder";
import { Processor } from "unified";
import { Visitor, VisitorResult, visit } from "unist-util-visit";
import { Handle } from "mdast-util-to-markdown";
import { Data, Parent, PhrasingContent, Text } from "mdast";

export interface Highlight extends Parent {
  type: "highlight";
  data?: Data;
  children: PhrasingContent[];
}

const visitor: Visitor<Text> = function (node, index, parent): VisitorResult {
  if (!parent) {
    return;
  }

  if (!/==\s*([^+]*[^ ])?\s*==/.test(node.value)) {
    return;
  }

  const children: Array<Text | Highlight> = [];
  const value = node.value;
  let tempValue = "";
  let prevMatchIndex = 0;
  let prevMatchLength = 0;

  const matches = Array.from(value.matchAll(/==\s*([^+]*[^ ])?\s*==/g));

  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];

    const mIndex = match.index ?? 0;
    const mLength = match[0].length; // match[0] is the matched input

    // could be a text part before each matched part
    const textPartIndex = index === 0 ? 0 : prevMatchIndex + prevMatchLength;

    prevMatchIndex = mIndex;
    prevMatchLength = mLength;

    // if there is a text part before
    if (mIndex > textPartIndex) {
      const textValue = value.substring(textPartIndex, mIndex);

      const textNode = u("text", textValue) as Text;
      children.push(textNode);
    }

    children.push({ type: "highlight", children: [{ type: "text", value: match[1] ?? "" }] });

    // control for the last text node if exists after the last match
    tempValue = value.slice(mIndex + mLength);
  }

  // if there is still text after the last match
  if (tempValue) {
    const textNode = u("text", tempValue) as Text;
    children.push(textNode);
  }

  if (children.length) {
    parent.children.splice(index!, 1, ...children);
  }
};

const handler: Handle = function (node, _parent, state, info): string {
  // @ts-expect-error
  const exit = state.enter("highlight");
  const tracker = state.createTracker(info);
  let value = tracker.move("==");
  value += tracker.move(state.containerPhrasing(node, {
    before: value,
    after: value,
    ...tracker.current(),
  }));
  value += tracker.move("==");
  exit();
  return value;
};

export function remarkHighlight(this: Processor) {
  const data = this.data();
  (data.fromMarkdownExtensions ?? (data.fromMarkdownExtensions = [])).push({
    transforms: [(tree) => {
      visit(tree, "text", visitor);
    }],
  });
  (data.toMarkdownExtensions ?? (data.toMarkdownExtensions = [])).push({
    handlers: {
      // @ts-expect-error
      highlight: handler,
    },
  });
}
