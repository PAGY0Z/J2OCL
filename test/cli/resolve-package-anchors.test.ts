/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { resolvePackageAnchors } from '../../src/cli/anchors/resolve-package-anchors.js';
import { createTestProgram } from './support/create-test-program.js';

const FULL_LIB_SOURCE = `
export abstract class Kernel {}
export function kernel<This extends typeof Kernel, Args extends unknown[]>(
  target: (this: This, ...args: Args) => void,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => void>,
): (this: This, ...args: Args) => void {
  return target;
}
export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;
export declare class Int8 {}
export declare class UInt8 {}
export declare class Int16 {}
export declare class UInt16 {}
export declare class Int32 {}
export declare class UInt32 {}
export declare class Int64 {}
export declare class UInt64 {}
export declare class Float32 {}
export declare class Float64 {}
export declare class Bool {}
export declare class CharArray {}
export declare class UCharArray {}
export declare class ShortArray {}
export declare class UShortArray {}
export declare class IntArray {}
export declare class UIntArray {}
export declare class LongArray {}
export declare class ULongArray {}
export declare class FloatArray {}
export declare class DoubleArray {}
`;

const ANCHOR_SOURCE = `
import {
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
} from './lib.js';
export {
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
};
`;

describe('resolvePackageAnchors', () => {
  it('resolves the Kernel class, kernel decorator, getGlobalId, and all 21 types', () => {
    const testProgram = createTestProgram({
      'lib.ts': FULL_LIB_SOURCE,
      'anchors.ts': ANCHOR_SOURCE,
    });
    try {
      const anchorFile = testProgram.getSourceFile('anchors.ts');
      const { kernelAnchors, loweringAnchors } = resolvePackageAnchors(testProgram.program, anchorFile);
      expect(kernelAnchors.kernelClass.name?.text).toBe('Kernel');
      expect(kernelAnchors.kernelDecorator.name?.text).toBe('kernel');
      expect(loweringAnchors.getGlobalId.name?.text).toBe('getGlobalId');
      expect(loweringAnchors.types.size).toBe(21);
      expect(loweringAnchors.types.get('FloatArray')?.name?.text).toBe('FloatArray');
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws when an expected name resolves to the wrong declaration kind', () => {
    const testProgram = createTestProgram({
      'lib.ts': FULL_LIB_SOURCE,
      'anchors.ts': `
import {
  kernel as Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
} from './lib.js';
export {
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
};
`,
    });
    try {
      const anchorFile = testProgram.getSourceFile('anchors.ts');
      expect(() => resolvePackageAnchors(testProgram.program, anchorFile)).toThrow('"Kernel" did not resolve to a class declaration');
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws when an expected function name resolves to a class instead', () => {
    const testProgram = createTestProgram({
      'lib.ts': FULL_LIB_SOURCE,
      'anchors.ts': `
import {
  Kernel, kernel, Kernel as getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
} from './lib.js';
export {
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
};
`,
    });
    try {
      const anchorFile = testProgram.getSourceFile('anchors.ts');
      expect(() => resolvePackageAnchors(testProgram.program, anchorFile)).toThrow('"getGlobalId" did not resolve to a function declaration');
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws when an imported name does not actually exist in the target module', () => {
    const testProgram = createTestProgram({
      'lib.ts': FULL_LIB_SOURCE,
      'anchors.ts': `
import { NonExistentThing as Kernel } from './lib.js';
export { Kernel };
`,
    });
    try {
      const anchorFile = testProgram.getSourceFile('anchors.ts');
      expect(() => resolvePackageAnchors(testProgram.program, anchorFile)).toThrow('"Kernel" has no declaration');
    } finally {
      testProgram.cleanup();
    }
  });

  it('ignores default/namespace imports, only reading named imports', () => {
    const testProgram = createTestProgram({
      'lib.ts': FULL_LIB_SOURCE,
      'anchors.ts': `
import * as everything from './lib.js';
import {
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
} from './lib.js';
export {
  everything,
  Kernel, kernel, getGlobalId,
  Int8, UInt8, Int16, UInt16, Int32, UInt32, Int64, UInt64, Float32, Float64, Bool,
  CharArray, UCharArray, ShortArray, UShortArray, IntArray, UIntArray, LongArray,
  ULongArray, FloatArray, DoubleArray,
};
`,
    });
    try {
      const anchorFile = testProgram.getSourceFile('anchors.ts');
      const { kernelAnchors } = resolvePackageAnchors(testProgram.program, anchorFile);
      expect(kernelAnchors.kernelClass.name?.text).toBe('Kernel');
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws when an import specifier resolves to no symbol at all', () => {
    const unboundName = ts.factory.createIdentifier('Kernel');
    const unboundImport = ts.factory.createImportDeclaration(undefined, ts.factory.createImportClause(false, undefined, ts.factory.createNamedImports([ts.factory.createImportSpecifier(false, undefined, unboundName)])), ts.factory.createStringLiteral('./lib.js'));
    const fakeAnchorFile = {
      statements: [unboundImport],
    } as unknown as ts.SourceFile;

    const testProgram = createTestProgram({ 'lib.ts': FULL_LIB_SOURCE });
    try {
      expect(() => resolvePackageAnchors(testProgram.program, fakeAnchorFile)).toThrow('could not resolve imported name "Kernel"');
    } finally {
      testProgram.cleanup();
    }
  });
});
