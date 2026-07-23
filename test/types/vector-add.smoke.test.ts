/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { FloatArray } from '../../src/types/array/float-array.js';
import { Float32 } from '../../src/types/scalar/float32.js';
import { UInt32 } from '../../src/types/scalar/uint32.js';

describe('vectorAdd smoke test', () => {
  it('adds two FloatArrays element-by-element using Float32 arithmetic', () => {
    const a = FloatArray.from([1, 2, 3, 4]);
    const b = FloatArray.from([5, 6, 7, 8]);
    const out = FloatArray.from([0, 0, 0, 0]);

    const length: UInt32 = out.length;
    for (
      let i: UInt32 = UInt32.of(0);
      i.lessThan(length).valueOf();
      i = i.add(UInt32.of(1))
    ) {
      out.set(i, a.get(i).add(b.get(i)));
    }

    expect(out.get(UInt32.of(0))).toEqual(Float32.of(6));
    expect(out.get(UInt32.of(1))).toEqual(Float32.of(8));
    expect(out.get(UInt32.of(2))).toEqual(Float32.of(10));
    expect(out.get(UInt32.of(3))).toEqual(Float32.of(12));
  });
});
