/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { FloatArray } from '../../../src/types/array/float-array.js';
import { Float32 } from '../../../src/types/scalar/float32.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('FloatArray', () => {
  it('stores and retrieves values through get()', () => {
    const array = FloatArray.from([1, 2, 3]);
    expect(array.get(UInt32.of(0))).toEqual(Float32.of(1));
    expect(array.get(UInt32.of(2))).toEqual(Float32.of(3));
  });

  it('set() overwrites a value in place', () => {
    const array = FloatArray.from([1, 2, 3]);
    array.set(UInt32.of(1), Float32.of(99));
    expect(array.get(UInt32.of(1))).toEqual(Float32.of(99));
  });

  it('exposes its length', () => {
    expect(FloatArray.from([1, 2, 3]).length).toEqual(UInt32.of(3));
  });

  it('rounds values to 32-bit float precision exactly like Float32 does, since storage is a real Float32Array', () => {
    const array = FloatArray.from([0.1]);
    expect(array.get(UInt32.of(0))).toEqual(Float32.of(0.1));
  });
});
