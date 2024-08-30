# Audio extension

Use this extension to render Audio element. The extension uses [Plyr](https://plyr.io/) as the playback interface.

## Options

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```typescript
Audio.configure({
  HTMLAttributes: {
    class: "my-custom-class",
  },
});
```

### dictionary

If you need to internationalize this extension, you can use this option.

```typescript
Audio.configure({
  dictionary: {
    name: "Audio",
    inputSrc: "Enter or paste link",
    inputAlt: "Audio description",
    inputTitle: "Audio title",
    audioOpen: "Open audio",
    audioUpload: "Upload audio",
    audioDelete: "Delete audio",
  },
});
```

### inline

Whether to set the audio extension to inline mode.

```typescript
Audio.configure({
  inline: false,
});
```

## Commands

### setAudio()

Insert a new audio element.

```typescript
editor.commands.setAudio({
  src: "https://example.com",
  title: "example title",
  align: "center",
  width: "100px"
});
```

## InputRules

```markdown
:audio{https://example.com}
```

## Markdown

```markdown
:audio{https://example.com}
```
