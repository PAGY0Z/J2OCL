/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { IntArray } from '../../../src/types/array/int-array.js';
import { Int32 } from '../../../src/types/scalar/int32.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('IntArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = IntArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(Int32.of(1));
    expect(array.get(UInt32.of(2))).toEqual(Int32.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = IntArray.from([1, 2, 3]);
    array.set(UInt32.of(1), Int32.of(99));
    expect(array.get(UInt32.of(1))).toEqual(Int32.of(99));
  });

  it('exposes its length', () => {
    expect(IntArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like Int32 does, since storage is a real Int32Array', () => {
    const array = IntArray.from([3000000000]);
    expect(array.get(UInt32.of(0))).toEqual(Int32.of(3000000000));
  });
});
