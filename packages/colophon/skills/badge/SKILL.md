---
name: colophon-badge
description: Use CphBadge for status chips and metadata IDs in Colophon apps. Correct tone roles, no decorative colors.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/Badge/Badge.tsx
  - ../../src/foundation/tokens.css
---

# Colophon Badge

Use `CphBadge` for IDs, deltas, status labels. Tones map to roles: neutral=muted, orange=active/attention, sage=done, error=urgent.

## Correct pattern

```tsx
import { CphBadge } from "@nickrobison/colophon";
<CphBadge tone="sage">+8.4%</CphBadge>
<CphBadge tone="error">3 urgent</CphBadge>
```

## Anti-patterns

- Do NOT use orange for decoration; orange means active/needs attention only.
- Do NOT render error with color alone — always include icon or text (spec §7).

## Must not do

- No custom hex colors; use tone prop only. No Radix badge wrapper.
