# J2OCL

[![CI](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml/badge.svg)](https://github.com/PAGY0Z/J2OCL/actions/workflows/ci.yml)
[![Line Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/PAGY0Z/J2OCL/badges/lines.json)](https://github.com/PAGY0Z/J2OCL/actions/workflows/coverage-badges.yml)
[![Branch Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/PAGY0Z/J2OCL/badges/branches.json)](https://github.com/PAGY0Z/J2OCL/actions/workflows/coverage-badges.yml)

J2OCL lets JavaScript and TypeScript developers write and run real OpenCL GPU kernels
without ever touching C or low-level code. It compiles a strict, fully-typed subset of
TS ahead of time into native OpenCL C, mirroring OpenCL's own types and execution model
as TypeScript classes, then executes it directly on any OpenCL-capable GPU or CPU
device.

## Installation

```bash
npm install @pagy0z/j2ocl
```

Requires Node.js >= 24.13.0.

## Quick Start

### 1. Write a kernel

A 4x4 matrix multiplication, one GPU thread per output cell, each summing a row of `a`
against a column of `b`:

```ts
// src/kernels.ts
import { Kernel, kernel, FloatArray, UInt32, Float32, getGlobalId } from '@pagy0z/j2ocl';

export class MathKernels extends Kernel {
  @kernel
  static matMul(a: FloatArray, b: FloatArray, out: FloatArray, size: UInt32): void {
    const row: UInt32 = getGlobalId(0);
    const col: UInt32 = getGlobalId(1);

    let sum: Float32 = Float32.of(0);
    for (let k: UInt32 = UInt32.of(0); k.lessThan(size); k = k.add(UInt32.of(1))) {
      sum = sum.add(a.get(row.mul(size).add(k)).mul(b.get(k.mul(size).add(col))));
    }
    out.set(row.mul(size).add(col), sum);
  }
}
```

### 2. Compile it to OpenCL C

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Then run the J2OCL compiler:

```bash
npx j2ocl build --project tsconfig.json
```

This writes `dist/kernels.MathKernels.matMul.cl` (the OpenCL C source) and a
`kernels.j2ocl.js`/`.d.ts` module you can import the compiled kernel from.

### 3. Run it

```ts
// src/main.ts
import { runKernel } from '@pagy0z/j2ocl/execute';
import { FloatArray, UInt32 } from '@pagy0z/j2ocl';
import { MathKernels_matMul } from './kernels.j2ocl.js';

const SIZE = 4;

const a = FloatArray.from([
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16,
]);
const b = FloatArray.from([
  16, 15, 14, 13,
  12, 11, 10, 9,
  8, 7, 6, 5,
  4, 3, 2, 1,
]);
const out = FloatArray.from(new Array(SIZE * SIZE).fill(0) as number[]);

runKernel({
  source: MathKernels_matMul.source,
  name: MathKernels_matMul.name,
  args: [
    { value: a, access: 'readOnly' },
    { value: b, access: 'readOnly' },
    { value: out, access: 'writeOnly' },
    { value: UInt32.of(SIZE) },
  ],
  globalWorkSize: [SIZE, SIZE],
});

const result = Array.from({ length: SIZE * SIZE }, (_, i) =>
  out.get(UInt32.of(i)).valueOf(),
);
for (let row = 0; row < SIZE; row++) {
  console.log(result.slice(row * SIZE, row * SIZE + SIZE));
}
// [ 80, 70, 60, 50 ]
// [ 240, 214, 188, 162 ]
// [ 400, 358, 316, 274 ]
// [ 560, 502, 444, 386 ]
```

```bash
npx tsc -p tsconfig.json
node dist/main.js
```

Running a kernel requires an OpenCL compatible device (GPU or CPU) with its driver
installed on the machine.

## Supported Types

All importable from `@pagy0z/j2ocl`:

| Scalar    | OpenCL C | Array         |
| --------- | -------- | ------------- |
| `Int8`    | `char`   | `CharArray`   |
| `UInt8`   | `uchar`  | `UCharArray`  |
| `Int16`   | `short`  | `ShortArray`  |
| `UInt16`  | `ushort` | `UShortArray` |
| `Int32`   | `int`    | `IntArray`    |
| `UInt32`  | `uint`   | `UIntArray`   |
| `Int64`   | `long`   | `LongArray`   |
| `UInt64`  | `ulong`  | `ULongArray`  |
| `Float32` | `float`  | `FloatArray`  |
| `Float64` | `double` | `DoubleArray` |
| `Bool`    | `bool`   | —             |

## Intrinsics Functions Available

| Function      | Signature                     | Maps to             |
| ------------- | ------------------------------ | -------------------- |
| `getGlobalId` | `(dimension: 0 \| 1 \| 2) => UInt32` | `get_global_id` |

## Development

```bash
npm install                     # install dependencies
npm run build                   # compile TypeScript to dist/
npm run typecheck               # type-check src/, test/, and config files without emitting
npm test                        # run the test suite once
npm run test:watch              # run the test suite in watch mode
npm run test:coverage           # run the test suite with line/branch coverage
npm run lint                    # lint the codebase
npm run format                  # format the codebase
npm run format:check            # check formatting without writing changes
npm run coverage:badges         # regenerate coverage badge data from the last coverage run
npm version patch|minor|major   # bumps the version in package.json, commits, and tags
```
