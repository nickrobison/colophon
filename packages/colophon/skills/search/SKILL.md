---
name: colophon-search
description: Use CphSearch for command-bar search with placeholder and quiet submit. Never the loudest element.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/Search/Search.tsx
---
# Colophon Search
Visible placeholder required (e.g. "Search concepts, sources, people…"). Submit never loudest.
## Correct pattern
```tsx
import { CphSearch } from "@nickrobison/colophon";
<CphSearch placeholder="Search concepts, sources, people…" onSubmit={run} />
```
