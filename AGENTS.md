# AGENTS.md

Guidance for AI agents and humans working in this repository.

## Project

Colophon is a React 19 design-system monorepo managed with pnpm. It contains the
`@nickrobison/colophon` component library, `@nickrobison/colophon-forms`, and a
demo app. Keep changes focused on the package or app they affect.

| Path                      | Package                       | Purpose                                                           |
| ------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `packages/colophon`       | `@nickrobison/colophon`       | Foundations and primitives: tokens, Button, Card, Badge, AppShell |
| `packages/colophon-forms` | `@nickrobison/colophon-forms` | Form primitives built on React Aria Components + TanStack Form    |
| `apps/demo`               | `@nickrobison/colophon-demo`  | Vite demo app; hosts a Storybook on port **6007**                 |
| `figma`                   | —                             | Figma Make prototype, not part of the workspace build             |

Workspace globs live in `pnpm-workspace.yaml` (`packages/*`, `apps/*`), so any
new package under either directory is picked up automatically.

## Development setup

- Use Node.js 22 or newer and pnpm 10.33.2.
- Install dependencies with `pnpm install --frozen-lockfile`.
- Run workspace commands from the repository root unless a package-specific
  command is needed.
- Toolchain: **oxfmt** 0.71.0 (formatter) and **oxlint** 1.86.0 (linter,
  configured in `.oxlintrc.json`).

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

<!--
`@nickrobison/colophon` intentionally ships source: its exports point to
`src/index.ts`, `src/foundation/tokens.css`, and `src/components.css`. Keep
`src/` in its `files` list instead of shipping unused build output.
-->

## Commands

The recursive scripts cover every workspace package.

```bash
pnpm run format        # oxfmt (writes)
pnpm run format:check  # oxfmt --check (CI gate)
pnpm run lint          # oxlint, then tsc --noEmit per package
pnpm run lint:fix      # oxlint --fix
pnpm run test          # vitest run --coverage, per package
pnpm run build         # tsc typecheck + vite build, per package

pnpm storybook         # colophon Storybook dev server
pnpm storybook:demo    # apps/demo Storybook dev server (port 6007)
```

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

All of the above must be clean before committing. If `format:check` fails, run
`pnpm run format` and re-verify.

Do not commit generated output. These are gitignored and CI rebuilds them:
`dist/`, `coverage/`, `storybook-static/`, `test-results/`, `playwright-report/`.

### Verifying commands correctly

**Never pipe `pnpm` through `head` or `tail` to read its exit code.** The
pipeline reports the exit status of the last command in the pipe, not `pnpm`'s,
so a failing check reads as a pass. Redirect to a file instead:

```bash
pnpm run lint > /tmp/lint.txt 2>&1; echo "LINT=$?"   # check LINT=0
grep -E 'error|warning' /tmp/lint.txt
```

This has silently produced false "LINT=0" readings more than once in this repo.

### Knowing which CI job covers your change

`.github/workflows/ci.yml` runs on every PR. Five of its seven jobs are scoped
to a single package via `pnpm --filter`, so **check which package a job actually
covers** before assuming a change is exercised:

| Job                                        | Scope                                          |
| ------------------------------------------ | ---------------------------------------------- |
| `lint`, `test`, `build`                    | Whole workspace (recursive scripts)            |
| `storybook`                                | `@nickrobison/colophon`                        |
| `storybook-tests`, `storybook-tests-macos` | `@nickrobison/colophon` only                   |
| `forms-e2e`                                | `@nickrobison/colophon-forms` Playwright specs |

Adding tests to a package does **not** automatically add a CI job for them. The
root `test` script does not run Playwright, so a green local `pnpm run test`
says nothing about E2E — run `pnpm --filter @nickrobison/colophon-forms test:e2e`
when you touch E2E specs or the stories they drive.

## Conventions that will bite you

- **`exactOptionalPropertyTypes` is enabled.** An optional prop declared
  `errorMessage?: string` cannot be assigned an explicit `undefined` (TS2375).
  Widen the type to `string | undefined`, or use a conditional spread. Do not
  cast the call site.
- **Never pipe `pnpm` output when checking exit codes** — see above.
- **Port 6007 belongs to `apps/demo`.** Long-running and easy to kill by
  accident. Scope any `pkill` to a specific port or PID; never use a broad
  pattern like `pkill -f http-server`.
- React Aria's `className` accepts a string **or** a render-props callback.
  Interpolating it into a template literal stringifies the function source.
  `composeClassName` in `colophon-forms` handles this.
- `FieldError` renders only while React Aria considers the field invalid, and
  only the **first** `slot="description"` in a component is registered.
- **Storybook 8.6 always runs a story's `play` in the iframe** — `autoplay` is
  hardcoded on with no URL or preview override. A story carrying a `play`
  mutates itself about a second after load, so Playwright specs must target
  stories that have no `play` function.

## Working on a package

Each package is self-contained: `src/`, `stories/`, `.storybook/`, and its own
`package.json`. Package-level `lint` is `tsc --noEmit -p tsconfig.json`, which
is the authoritative type check — prefer it over editor diagnostics.

Run package-scoped commands with `pnpm --filter <pkg> <script>`, e.g.

```bash
pnpm --filter @nickrobison/colophon-forms test
```
