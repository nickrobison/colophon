---
name: colophon-uploadzone
description: Use CphUploadZone for file selection with drag-and-drop and progress. onSelect supplies selected files; upload state via isUploading + progress; error display via error prop.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/CphUploadZone/CphUploadZone.tsx
  - ../../src/foundation/tokens.css
---

# Colophon UploadZone

`CphUploadZone` wraps react-aria `DropZone` + `FileTrigger`. Selection flows through `onSelect`;
the consumer drives upload state (`isUploading` / `progress`) and error display (`error`).

## Correct pattern

```tsx
import { CphUploadZone } from "@nickrobison/colophon";

<CphUploadZone
  label="Upload transcript"
  accept={[".pdf"]}
  hints={["PDF files only"]}
  onSelect={(files) => setFiles(files)}
/>;
```

## Anti-patterns

- Do NOT render a raw `<input type="file">` yourself; use the component's picker.
- Do NOT put upload logic (network calls, progress simulation) inside the component; the consumer
  supplies `isUploading` / `progress` and renders errors via `error`.

## Must not do

- No hand-rolled progress bars; use the Meter via `isUploading` and `progress`.
- No accepting files outside the `accept` list; the component filters and surfaces nothing silently.
