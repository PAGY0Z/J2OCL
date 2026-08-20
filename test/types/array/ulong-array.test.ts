/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { ULongArray } from '../../../src/types/array/ulong-array.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';
import { UInt64 } from '../../../src/types/scalar/uint64.js';

describe('ULongArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = ULongArray.from([1n, 2n, 3n]);
    expect(array.get(UInt32.of(0))).toEqual(UInt64.of(1n));
    expect(array.get(UInt32.of(2))).toEqual(UInt64.of(3n));
  });

  it('set() overwrites a value in place', () => {
    const array = ULongArray.from([1n, 2n, 3n]);
    array.set(UInt32.of(1), UInt64.of(99n));
    expect(array.get(UInt32.of(1))).toEqual(UInt64.of(99n));
  });

  it('exposes its length', () => {
    expect(ULongArray.from([1n, 2n, 3n]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like UInt64 does, since storage is a real BigUint64Array', () => {
    const tooLarge = 18446744073709551615n + 1n;
    const array = ULongArray.from([tooLarge]);
    expect(array.get(UInt32.of(0))).toEqual(UInt64.of(tooLarge));
  });
});
