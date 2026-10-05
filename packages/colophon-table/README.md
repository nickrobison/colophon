# @nickrobison/colophon-table

Colophon data tables — dense, comparison-focused ledger tables.

## Status: scaffold

This package is **an empty scaffold**. It currently ships no components. The manifest, TypeScript,
build, lint, test, Storybook, and Playwright configuration are in place, and the package is wired into
the pnpm workspace, but nothing is implemented yet.

Do not import from `@nickrobison/colophon-table` expecting components to exist.

## What is planned

- A headless table engine built on [TanStack Table](https://tanstack.com/table) v9.
- Design-system primitives: sortable headers, a pinned first column, expandable rows, row selection,
  an opt-in aggregate summary row, skeleton and empty states, pagination, a toolbar, mobile stacked
  cards, and a mobile sort/filter sheet.
- A `--cph-table-*` token layer derived from the existing `@nickrobison/colophon` tokens, with full
  light and dark support and three density modes (Comfortable / Compact / Dense).

## Peer dependency

This package peer-depends on `@nickrobison/colophon` for its design tokens and shared primitives.
Import the token layer before the component layer:

```ts
import "@nickrobison/colophon/foundation.css";
import "@nickrobison/colophon/components.css";
import "@nickrobison/colophon-table/table-tokens.css";
import "@nickrobison/colophon-table/components.css";
```

## Scripts

| Script               | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `build`              | Type-check, then bundle the library with Vite.       |
| `lint`               | `tsc --noEmit` against the package tsconfig.         |
| `test`               | Vitest with V8 coverage.                             |
| `storybook`          | Storybook dev server on port 6409.                   |
| `build-storybook`    | Static Storybook build.                              |
| `test-storybook:ci`  | Serve the built Storybook and run interaction tests. |
| `test:e2e`           | Playwright end-to-end suite (port 6408).             |
| `playwright:install` | Install the Chromium build Playwright needs.         |

## Conventions

Built with `react-aria-components` — do not import directly from `react-aria` or `react-stately`.
Format with the repository's Oxfmt configuration. Run the workspace gates before submitting:
`pnpm run format:check`, `pnpm run lint`, `pnpm run test`, `pnpm run build`.

## License

MIT
