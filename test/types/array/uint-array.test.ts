/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { UIntArray } from '../../../src/types/array/uint-array.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('UIntArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = UIntArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(UInt32.of(1));
    expect(array.get(UInt32.of(2))).toEqual(UInt32.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = UIntArray.from([1, 2, 3]);
    array.set(UInt32.of(1), UInt32.of(99));
    expect(array.get(UInt32.of(1))).toEqual(UInt32.of(99));
  });

  it('exposes its length', () => {
    expect(UIntArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like UInt32 does, since storage is a real Uint32Array', () => {
    const array = UIntArray.from([5000000000]);
    expect(array.get(UInt32.of(0))).toEqual(UInt32.of(5000000000));
  });
});
