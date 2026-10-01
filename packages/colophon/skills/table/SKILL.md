---
name: colophon-table
description: Use CphTable for dense ledger tables with expandable rows. Desktop table, mobile stacked cards.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/Table/CphTable.tsx
---
# Colophon Table
Real `<table>` with expandable detail rows. Mobile: stacked cards, no horizontal scroll.
## Correct pattern
```tsx
import { CphTable } from "@nickrobison/colophon";
<CphTable rows={rows} />
```
## Anti-patterns
- Do NOT allow horizontal scroll; stack to cards under 820px.
