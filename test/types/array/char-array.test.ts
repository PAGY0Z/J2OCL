/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CharArray } from '../../../src/types/array/char-array.js';
import { Int8 } from '../../../src/types/scalar/int8.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('CharArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = CharArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(Int8.of(1));
    expect(array.get(UInt32.of(2))).toEqual(Int8.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = CharArray.from([1, 2, 3]);
    array.set(UInt32.of(1), Int8.of(99));
    expect(array.get(UInt32.of(1))).toEqual(Int8.of(99));
  });

  it('exposes its length', () => {
    expect(CharArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like Int8 does, since storage is a real Int8Array', () => {
    const array = CharArray.from([200]);
    expect(array.get(UInt32.of(0))).toEqual(Int8.of(200));
  });
});
