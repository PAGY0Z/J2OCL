/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { DoubleArray } from '../../../src/types/array/double-array.js';
import { Float64 } from '../../../src/types/scalar/float64.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('DoubleArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = DoubleArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(Float64.of(1));
    expect(array.get(UInt32.of(2))).toEqual(Float64.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = DoubleArray.from([1, 2, 3]);
    array.set(UInt32.of(1), Float64.of(99));
    expect(array.get(UInt32.of(1))).toEqual(Float64.of(99));
  });

  it('exposes its length', () => {
    expect(DoubleArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('keeps full 64-bit precision, unlike FloatArray', () => {
    const array = DoubleArray.from([0.1]);
    expect(array.get(UInt32.of(0))).toEqual(Float64.of(0.1));
    expect(array.get(UInt32.of(0)).valueOf()).toBe(0.1);
  });
});
