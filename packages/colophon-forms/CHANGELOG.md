# Changelog

All notable changes to `@nickrobison/colophon-forms` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `useCphForm` hook: single `useForm` wiring for the package — TanStack's form
  plus Colophon defaults (Standard Schema composed with inline submit
  validators, serialized debounced autosave). `CphForm` now delegates to it;
  its public API is unchanged.
- `useCphField` hook: binds a TanStack form field to a `CphField` without the
  `form.Field` render-prop boilerplate. Raw Colophon validators (e.g.
  `required`, `email`) are wrapped in `toValidator` automatically, and
  validation runs on blur and on submit by default
  (`validateOn: "change"` opts into change timing).
- `cphFieldId` helper: the `<name>-field` field-id convention shared by field
  bindings and error-summary links.

### Changed

- `CphForm`'s `getFieldId` now defaults to the documented `<name>-field`
  convention instead of the identity mapping. Forms whose field ids already
  follow that convention are unaffected; consumers that relied on the identity
  mapping should pass `getFieldId={(name) => name}` explicitly.

[Unreleased]: https://github.com/nickrobison/colophon/compare/d8b0e54...HEAD
