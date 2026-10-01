---
name: colophon-button
description: Use CphButton (pure react-aria) for all Colophon actions. Variants, focus ring, 44px targets.
type: skill
library: "@nickrobison/colophon"
library_version: 0.1.0
sources:
  - ../../src/components/Button/CphButton.tsx
  - ../../src/foundation/tokens.css
---

# Colophon Button

`CphButton` wraps react-aria `Button`. Variants: primary, secondary, text, icon, nav.

## Correct pattern

```tsx
import { CphButton } from "@nickrobison/colophon";
<CphButton variant="primary" onPress={submit}>
  New inquiry
</CphButton>;
```

## Anti-patterns

- Do NOT use native `<button>` directly; you lose press + focus + keyboard behavior.
- Do NOT make submit the loudest element on search forms (use variant="text").

## Must not do

- No Radix button. No missing aria-label on icon-only buttons.
