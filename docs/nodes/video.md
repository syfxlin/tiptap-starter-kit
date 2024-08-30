# Video extension

Use this extension to render Video element. The extension uses [Plyr](https://plyr.io/) as the playback interface.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Video.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Video.configure({
  dictionary: {
    name: "Video",
    inputSrc: "Enter or paste link",
    inputAlt: "Video description",
    inputTitle: "Video title",
    videoOpen: "Open video",
    videoUpload: "Upload video",
    videoDelete: "Delete video",
  },
});
```

### inline

Whether to set the video extension to inline mode.

```typescript
Video.configure({
  inline: false,
});
```

## Commands

### setVideo()

Insert a new video element.

```typescript
editor.commands.setVideo({
  src: "https://example.com",
  title: "example title",
  align: "center",
  width: "100px"
});
```

## InputRules

```markdown
:video{https://example.com}
```

## Markdown

```markdown
:video{https://example.com}
```
