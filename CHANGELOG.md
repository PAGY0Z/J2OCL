# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
