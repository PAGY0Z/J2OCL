/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { detectKernels } from '../../src/cli/detection/detect-kernels.js';
import { compileKernel } from '../../src/compiler/compile-kernel.js';
import type { LoweringAnchors } from '../../src/compiler/lowering-anchors.js';
import { createTestProgram, type TestProgram } from '../cli/support/create-test-program.js';

const LIB_SOURCE = `
export abstract class Kernel {}

export function kernel<This extends typeof Kernel, Args extends unknown[]>(
  target: (this: This, ...args: Args) => void,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => void>,
): (this: This, ...args: Args) => void {
  return target;
}

export declare class UInt32 {
  static of(raw: number): UInt32;
  add(other: UInt32): UInt32;
  lessThan(other: UInt32): Bool;
}

export declare class Bool {}

export declare class FloatArray {
  get(index: UInt32): Float32;
  set(index: UInt32, value: Float32): void;
  readonly length: UInt32;
}

export declare class Float32 {
  add(other: Float32): Float32;
}

export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;
`;

function getAnchors(testProgram: TestProgram) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  const findClass = (name: string) => libSourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === name)!;
  const findFunction = (name: string) => libSourceFile.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)!;

  const kernelClass = findClass('Kernel');
  const kernelDecorator = findFunction('kernel');
  const loweringAnchors: LoweringAnchors = {
    getGlobalId: findFunction('getGlobalId'),
    types: new Map([
      ['UInt32', findClass('UInt32')],
      ['Bool', findClass('Bool')],
      ['FloatArray', findClass('FloatArray')],
      ['Float32', findClass('Float32')],
    ]),
  };
  return { kernelClass, kernelDecorator, loweringAnchors };
}

describe('compileKernel', () => {
  it('compiles the reference vectorAdd-with-loop kernel to real OpenCL C', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static vectorAdd(a: Lib.FloatArray, b: Lib.FloatArray, out: Lib.FloatArray, length: Lib.UInt32) {
    for (let i: Lib.UInt32 = Lib.UInt32.of(0); i.lessThan(length); i = i.add(Lib.UInt32.of(1))) {
      out.set(i, a.get(i).add(b.get(i)));
    }
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernels } = detectKernels(testProgram.program, anchors);
      const result = compileKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.code).toBe('__kernel void vectorAdd(__global float* a, __global float* b, __global float* out, uint length) {\n' + '  for (uint i = 0u; (i < length); i = (i + 1u)) {\n' + '    out[i] = (a[i] + b[i]);\n' + '  }\n' + '}');
      }
    } finally {
      testProgram.cleanup();
    }
  });

  it('returns a diagnostic instead of code for a kernel that reads .length on an array', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static usesLength(out: Lib.FloatArray) {
    const n: Lib.UInt32 = out.length;
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernels } = detectKernels(testProgram.program, anchors);
      const result = compileKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.diagnostics[0].message).toMatch(/\.length.*cannot be used inside a compiled kernel/);
      }
    } finally {
      testProgram.cleanup();
    }
  });

  it('returns diagnostics instead of code for an untranslatable kernel', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static bad(xs: Lib.UInt32[]) {
    for (const x of xs) {}
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernels } = detectKernels(testProgram.program, anchors);
      const result = compileKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.diagnostics.length).toBeGreaterThan(0);
        expect(result.diagnostics[0].message).toMatch(/for...of/);
      }
    } finally {
      testProgram.cleanup();
    }
  });
});
