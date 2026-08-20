/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { LongArray } from '../../../src/types/array/long-array.js';
import { Int64 } from '../../../src/types/scalar/int64.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('LongArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = LongArray.from([1n, 2n, 3n]);
    expect(array.get(UInt32.of(0))).toEqual(Int64.of(1n));
    expect(array.get(UInt32.of(2))).toEqual(Int64.of(3n));
  });

  it('set() overwrites a value in place', () => {
    const array = LongArray.from([1n, 2n, 3n]);
    array.set(UInt32.of(1), Int64.of(99n));
    expect(array.get(UInt32.of(1))).toEqual(Int64.of(99n));
  });

  it('exposes its length', () => {
    expect(LongArray.from([1n, 2n, 3n]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like Int64 does, since storage is a real BigInt64Array', () => {
    const tooLarge = 9223372036854775807n + 1n;
    const array = LongArray.from([tooLarge]);
    expect(array.get(UInt32.of(0))).toEqual(Int64.of(tooLarge));
  });
});
