/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { ShortArray } from '../../../src/types/array/short-array.js';
import { Int16 } from '../../../src/types/scalar/int16.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('ShortArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = ShortArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(Int16.of(1));
    expect(array.get(UInt32.of(2))).toEqual(Int16.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = ShortArray.from([1, 2, 3]);
    array.set(UInt32.of(1), Int16.of(99));
    expect(array.get(UInt32.of(1))).toEqual(Int16.of(99));
  });

  it('exposes its length', () => {
    expect(ShortArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like Int16 does, since storage is a real Int16Array', () => {
    const array = ShortArray.from([40000]);
    expect(array.get(UInt32.of(0))).toEqual(Int16.of(40000));
  });
});
