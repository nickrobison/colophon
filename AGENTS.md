# Repository Guide

Colophon is a React 19 design-system monorepo managed with pnpm. It contains the
`@nickrobison/colophon` component library, `@nickrobison/colophon-forms`, and a
demo app. Keep changes focused on the package or app they affect.

## Development setup

- Use Node.js 22 or newer and pnpm 10.33.2.
- Install dependencies with `pnpm install --frozen-lockfile`.
- Run workspace commands from the repository root unless a package-specific
  command is needed.

## Implementation practices

- Follow the existing component patterns in `packages/colophon/src/components`
  and colocate component tests and Storybook stories with the component.
- Build interactive UI with `react-aria-components`; do not import directly
  from `react-aria` or `react-stately`.
- Prefer existing Colophon design tokens and component styles over introducing
  one-off visual values. Keep public component props and exports typed.
- Preserve accessible names, keyboard behavior, and focus and error states.
  Add or update tests for changed behavior, including relevant interaction
  states.
- Keep dependencies and public API changes to a minimum. Do not update the
  lockfile unless dependencies actually change.
- Format with the repository's Oxfmt configuration (100-column print width,
  semicolons, double quotes, trailing commas).

## Quality gates

Before submitting, run the checks that apply to the change:

```sh
pnpm run format:check
pnpm run lint
pnpm run test
pnpm run build
```

These are the repository's CI format/lint, test, and build checks. If a change
affects Storybook stories or their behavior, also run the relevant Storybook
build and tests:

```sh
pnpm --filter @nickrobison/colophon build-storybook
pnpm --filter @nickrobison/colophon playwright:install
pnpm --filter @nickrobison/colophon test-storybook:ci --browsers firefox webkit
```

If a change affects the component skills, validate them with
`pnpm run validate:skills`.
