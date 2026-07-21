# J2OCL

[![CI](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml/badge.svg)](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml)
[![Line Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/PAGY0Z/J2OCL/badges/lines.json)](https://github.com/PAGY0Z/J2OCL/actions/workflows/coverage-badges.yml)
[![Branch Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/PAGY0Z/J2OCL/badges/branches.json)](https://github.com/PAGY0Z/J2OCL/actions/workflows/coverage-badges.yml)

J2OCL lets JavaScript and TypeScript developers write real OpenCL GPU kernels without
ever touching C or low-level code. It compiles a strict, fully-typed subset of TS ahead
of time into native OpenCL C, mirroring OpenCL's own types and execution model as
TypeScript classes.

## Commands

```bash
npm install                  # install dependencies
npm run build                # compile TypeScript to dist/
npm run typecheck            # type-check src/, test/, and config files without emitting
npm test                     # run the test suite once
npm run test:watch           # run the test suite in watch mode
npm run test:coverage        # run the test suite with line/branch coverage
npm run lint                 # lint the codebase
npm run format               # format the codebase
npm run format:check         # check formatting without writing changes
npm run docs:sync-version    # manually sync the version/year in documentations/index.html
npm run coverage:badges      # regenerate coverage badge data from the last coverage run
npm version patch|minor|major
# bumps the version in package.json, then automatically re-runs
# docs:sync-version and stages the updated documentation file
# before npm creates its version-bump commit and tag
```
