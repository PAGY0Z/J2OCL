/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CharArray } from '../../src/types/array/char-array.js';
import { UCharArray } from '../../src/types/array/uchar-array.js';
import { ShortArray } from '../../src/types/array/short-array.js';
import { UShortArray } from '../../src/types/array/ushort-array.js';
import { IntArray } from '../../src/types/array/int-array.js';
import { UIntArray } from '../../src/types/array/uint-array.js';
import { LongArray } from '../../src/types/array/long-array.js';
import { ULongArray } from '../../src/types/array/ulong-array.js';
import { FloatArray } from '../../src/types/array/float-array.js';
import { DoubleArray } from '../../src/types/array/double-array.js';
import { elementCTypeOf, isAnyJ2OCLArray } from '../../src/host-api/arguments/array-element-type.js';

describe('elementCTypeOf', () => {
  it.each([
    [CharArray.from([1]), 'char'],
    [UCharArray.from([1]), 'uchar'],
    [ShortArray.from([1]), 'short'],
    [UShortArray.from([1]), 'ushort'],
    [IntArray.from([1]), 'int'],
    [UIntArray.from([1]), 'uint'],
    [LongArray.from([1n]), 'long'],
    [ULongArray.from([1n]), 'ulong'],
    [FloatArray.from([1]), 'float'],
    [DoubleArray.from([1]), 'double'],
  ] as const)('resolves %#', (array, expected) => {
    expect(elementCTypeOf(array)).toBe(expected);
  });

  it('throws for a non-array value', () => {
    expect(() => elementCTypeOf({} as never)).toThrow('elementCTypeOf: not a J2OCL array instance');
  });
});

describe('isAnyJ2OCLArray', () => {
  it('returns true for a J2OCL array instance', () => {
    expect(isAnyJ2OCLArray(FloatArray.from([1]))).toBe(true);
  });

  it('returns false for a non-array value', () => {
    expect(isAnyJ2OCLArray({})).toBe(false);
    expect(isAnyJ2OCLArray(42)).toBe(false);
  });
});
