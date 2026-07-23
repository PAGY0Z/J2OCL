/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { UCharArray } from '../../../src/types/array/uchar-array.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';
import { UInt8 } from '../../../src/types/scalar/uint8.js';

describe('UCharArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = UCharArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(UInt8.of(1));
    expect(array.get(UInt32.of(2))).toEqual(UInt8.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = UCharArray.from([1, 2, 3]);
    array.set(UInt32.of(1), UInt8.of(99));
    expect(array.get(UInt32.of(1))).toEqual(UInt8.of(99));
  });

  it('exposes its length', () => {
    expect(UCharArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('truncates out-of-range values exactly like UInt8 does, since storage is a real Uint8Array', () => {
    const array = UCharArray.from([300]);
    expect(array.get(UInt32.of(0))).toEqual(UInt8.of(300));
  });
});
