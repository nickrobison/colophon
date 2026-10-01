---
name: colophon-card
description: Use CphCard for ledger cards with expandable research notes. L1 depth, hover to L2, no nested shadows.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/Card/Card.tsx
  - ../../src/foundation/tokens.css
---
# Colophon Card
L1 raised (hairline + shadow-l1), hover floats to L2. Detail opens on demand.
## Correct pattern
```tsx
import { CphCard } from "@nickrobison/colophon";
<CphCard id="KPL-041" title="Civic order" owner="Ada Mercer" sources={128} stageLabel="Synthesis" note="..." concepts={["Empiricism"]} />
```
## Anti-patterns
- Do NOT nest shadows or combine heavy border + shadow + bg change (spec §5).
- Do NOT show full note at rest; expand on toggle.
