# J2OCL

[![CI](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml/badge.svg)](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml)

## Commands

```bash
npm install                # install dependencies
npm run build               # compile TypeScript to dist/
npm test                    # run the test suite once
npm run test:watch          # run the test suite in watch mode
npm run lint                # lint the codebase
npm run format               # format the codebase
npm run format:check        # check formatting without writing changes
npm run docs:sync-version   # manually sync the version/year in documentations/index.html
npm version patch|minor|major
# bumps the version in package.json, then automatically re-runs
# docs:sync-version and stages the updated documentation file
# before npm creates its version-bump commit and tag
```
