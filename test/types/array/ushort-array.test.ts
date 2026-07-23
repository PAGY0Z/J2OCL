/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { UShortArray } from '../../../src/types/array/ushort-array.js';
import { UInt16 } from '../../../src/types/scalar/uint16.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('UShortArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = UShortArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(UInt16.of(1));
    expect(array.get(UInt32.of(2))).toEqual(UInt16.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = UShortArray.from([1, 2, 3]);
    array.set(UInt32.of(1), UInt16.of(99));
    expect(array.get(UInt32.of(1))).toEqual(UInt16.of(99));
  });

  it('exposes its length', () => {
    expect(UShortArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like UInt16 does, since storage is a real Uint16Array', () => {
    const array = UShortArray.from([70000]);
    expect(array.get(UInt32.of(0))).toEqual(UInt16.of(70000));
  });
});
