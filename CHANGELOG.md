# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-07-23

### Added

- OpenCL scalar types (`src/types/scalar/`): `Int8`, `UInt8`, `Int16`, `UInt16`, `Int32`,
  `UInt32`, `Int64`, `UInt64`, `Float32`, `Float64`, and `Bool`. Each one is a real,
  immutable class — never a plain JS `number` — that behaves exactly like its OpenCL C
  counterpart: integer types wrap around on overflow the same way C does, `Float32` rounds
  to 32-bit precision, and `Int64`/`UInt64` are backed by `bigint` so they can hold the full
  64-bit range. Every numeric type supports arithmetic (`add`, `sub`, `mul`, `div`, `mod`,
  `negate`), comparisons (`greaterThan`, `lessThan`, `greaterThanOrEqual`,
  `lessThanOrEqual`, `equals`, `notEquals`), and, on integer types, bitwise operations
  (`bitwiseAnd`, `bitwiseOr`, `bitwiseXor`, `bitwiseNot`, `shiftLeft`, `shiftRight`).
  Integer `div`/`mod` throw on a zero divisor instead of guessing, since real GPUs disagree
  on what dividing by zero should do. `Bool` gets logical operators instead (`and`, `or`,
  `not`, `equals`, `notEquals`) and has no array/buffer counterpart, since real OpenCL
  forbids `bool` as a kernel argument type.
- OpenCL array types (`src/types/array/`): `CharArray`, `UCharArray`, `ShortArray`,
  `UShortArray`, `IntArray`, `UIntArray`, `LongArray`, `ULongArray`, `FloatArray`, and
  `DoubleArray`. Each one wraps a native typed array (`Int8Array`, `Float32Array`,
  `BigInt64Array`, ...) with zero copying, so its memory layout matches what an OpenCL
  buffer expects. Reading and writing go through typed `get()`/`set()` methods that
  return/accept the matching scalar type (e.g. `FloatArray.get()` returns a `Float32`, not
  a raw `number`), and `.length` returns a `UInt32` for the same reason.
- Full unit test coverage for both type families, plus a smoke test that replays a small
  `vectorAdd` computation end to end using `FloatArray` and `Float32`.

## [0.1.1] - 2026-07-21

### Added

- Short library description in `README.md`.

### Changed

- `publish-npm.yml` now authenticates to the npm registry via OIDC trusted publishing
  instead of a stored `NPM_TOKEN` secret.

## [0.1.0] - 2026-07-21

### Added

- Initial project scaffold: TypeScript configuration, source folder structure, Vitest, ESLint, Prettier.
- Proprietary license and per-file copyright headers.
- Printable A4 documentation cover page with automatic version/year sync.
- Continuous integration workflow (formatting, lint, type-checking, build, test, dependency audit),
  scoped to least-privilege `contents: read` permissions.
- Repository hygiene: `.gitattributes`, `.editorconfig`, Dependabot configuration.
- Automated GitHub Release workflow triggered by version tags.
- Package scoped and made publishable as `@pagy0z/j2ocl`, with a `prepare` script so
  Git-based installs build `dist/` automatically.
- Publish workflows for the public npm registry and for GitHub Packages, both triggered
  by version tags.
- GitHub repository configuration: branch protection ruleset for `main` (required pull
  request, required CI checks, no force-push/deletion), repository topics, and security
  settings (secret scanning push protection, Dependabot security updates).
- Line and branch coverage via `@vitest/coverage-v8` (`npm run test:coverage`), measured
  in CI but with no enforced minimum threshold yet. Self-hosted coverage badges (no
  external service) published to a dedicated `badges` branch on every push to `main`
  and shown in the README via shields.io endpoint badges.
- `J2OCL.Kernel` base class and `@J2OCL.kernel` static-method decorator, marking a
  static method as a kernel entry point (enforced both at compile time and at runtime).
  Definition only for now — calling a decorated method behaves like an ordinary static
  method call; development-mode simulation and GPU dispatch are a separate, not yet
  implemented feature.
- Vitest now transforms `.ts`/`.mts`/`.cts` sources through `esbuild` (new devDependency)
  ahead of its default transform, so TC39 stage-3 class decorators (used by `@J2OCL.kernel`)
  run correctly under the test suite.
- Kernel detection via the TypeScript compiler API (`detectKernels` in `src/cli/`):
  given a `ts.Program` and the real `Kernel`/`kernel` declarations to match against,
  finds every valid `@kernel`-decorated static method on a class (transitively)
  extending `Kernel`, matching by resolved symbol rather than by name so aliased
  imports and unrelated homonymous code are handled correctly. Defensively
  re-validates class ancestry and static-method placement, and fails loudly if either
  constraint was bypassed via `@ts-expect-error`/`@ts-ignore` in the analyzed source.
  Not yet wired into a runnable CLI command, and does not yet lower results to an
  intermediate representation — both remain future work. Adds `@types/node` (new
  devDependency) for the test helpers that build these programs, the first code in
  this repo to use Node built-ins (`fs`/`os`/`path`/`url`) directly.
