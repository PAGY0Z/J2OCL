/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { detectKernels } from '../../../src/cli/detection/detect-kernels.js';
import type { LoweringAnchors } from '../../../src/compiler/lowering-anchors.js';
import { lowerKernel } from '../../../src/compiler/lowering/kernel.js';
import { createTestProgram, type TestProgram } from '../../cli/support/create-test-program.js';

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
  const findClass = (name: string) => libSourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === name);
  const findFunction = (name: string) => libSourceFile.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name);

  const kernelClass = findClass('Kernel')!;
  const kernelDecorator = findFunction('kernel')!;
  const getGlobalIdDecl = findFunction('getGlobalId')!;
  const uint32 = findClass('UInt32')!;
  const bool = findClass('Bool')!;
  const floatArray = findClass('FloatArray')!;
  const float32 = findClass('Float32')!;

  const loweringAnchors: LoweringAnchors = {
    getGlobalId: getGlobalIdDecl,
    types: new Map([
      ['UInt32', uint32],
      ['Bool', bool],
      ['FloatArray', floatArray],
      ['Float32', float32],
    ]),
  };
  return { kernelClass, kernelDecorator, loweringAnchors };
}

describe('lowerKernel — parameters and overall result shape', () => {
  it('lowers parameters into the initial scope and the body into an IRBlock', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {}
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernels } = detectKernels(testProgram.program, anchors);
      const { kernel, diagnostics } = lowerKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);

      expect(diagnostics).toEqual([]);
      expect(kernel!.name).toBe('k');
      expect(kernel!.parameters).toEqual([
        { name: 'out', type: 'FloatArray' },
        { name: 'n', type: 'UInt32' },
      ]);
      expect(kernel!.body.statements).toEqual([]);
    } finally {
      testProgram.cleanup();
    }
  });
});
