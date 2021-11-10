import { EmbedItem } from "./Embed";

const img = (attrs: { src: string; alt: string }) => {
  const img = document.createElement("img");
  img.src = attrs.src;
  img.alt = attrs.alt;
  return img;
};

export const defaultEmbedItems: EmbedItem[] = [
  {
    name: "Airtable",
    icon: img({
      src: "https://airtable.com/favicon.ico",
      alt: "Airtable icon",
    }),
    matcher: (src) => {
      const match = src.match(
        /(?:https?:\/\/)?airtable.com\/(?:embed\/)?(shr.*)$/i
      );
      if (!match) {
        return null;
      }
      return `https://airtable.com/embed/${match[1]}`;
    },
  },
  {
    name: "CodePen",
    icon: img({
      src: "https://codepen.io/favicon.ico",
      alt: "CodePen icon",
    }),
    matcher: (src) => {
      const match = src.match(/(?:https?:\/\/)?codepen\.?io\/?(.*)$/i);
      if (!match) {
        return null;
      }
      return `https://codepen.io/${match[1].replace("/pen/", "/embed/")}`;
    },
  },
  {
    name: "CodeSandbox",
    icon: img({
      src: "https://codesandbox.io/favicon.ico",
      alt: "CodeSandbox icon",
    }),
    matcher: (src) => {
      const match = src.match(/(?:https?:\/\/)?codesandbox\.?io\/?(.*)$/i);
      if (!match) {
        return null;
      }
      return `https://codesandbox.io/${match[1].replace(/^s\//, "embed/")}`;
    },
    view: (iframe) => {
      iframe.allow =
        "fullscreen; accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking";
      iframe.sandbox.add(
        "allow-forms",
        "allow-modals",
        "allow-popups",
        "allow-presentation",
        "allow-same-origin",
        "allow-scripts"
      );
    },
  },
  {
    name: "Draw.io",
    icon: img({
      src: "https://app.diagrams.net/favicon.ico",
      alt: "Draw.io icon",
    }),
    matcher: (src) => {
      const match = src.match(
        /(?:https?:\/\/)?(?:app|viewer)\.diagrams\.?net\/?(.*)$/i
      );
      if (!match) {
        return null;
      }
      return `https://viewer.diagrams.net/${match[1].substring(
        match[1].lastIndexOf("#")
      )}`;
    },
  },
  {
    name: "Gist",
    icon: img({
      src: "https://github.com/favicon.ico",
      alt: "Gist icon",
    }),
    matcher: (src) => {
      const match = src.match(/(?:https?:\/\/)?gist\.github\.?com\/?(.*)$/i);
      if (!match) {
        return null;
      }
      return `
          data:text/html;charset=utf-8,
          <head><base target='_blank' /></head>
          <body>
            <script src="https://gist.github.com/${match[1]}.js"></script>
          </body>
        `;
    },
  },
  {
    name: "Google Docs",
    icon: img({
      src: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
      alt: "Google docs icon",
    }),
    matcher: (src) => {
      const match = src.match(/(?:https?:\/\/)?docs\.google\.com\/?(.*)$/i);
      if (!match) {
        return null;
      }
      return `https://docs.google.com/${match[1]}`.replace("/edit", "/preview");
    },
  },
  {
    name: "Office",
    icon: img({
      src: "https://c1-word-view-15.cdn.office.net/wv/resources/1033/FavIcon_Word.ico",
      alt: "Office icon",
    }),
    matcher: (src) => {
      const match = src.match(
        /(?:https?:\/\/)?onedrive\.live\.com\/embed\/?(.*)$/i
      );
      if (!match) {
        return null;
      }
      return src;
    },
  },
];
