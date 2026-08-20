/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { FloatArray } from '../../../src/types/array/float-array.js';
import { getRawBuffer } from '../../../src/types/array/raw-access.js';

describe('getRawBuffer', () => {
  it('returns the native typed array backing a FloatArray', () => {
    const array = FloatArray.from([1, 2, 3]);
    const raw = getRawBuffer(array);
    expect(raw).toBeInstanceOf(Float32Array);
    expect(Array.from(raw as Float32Array)).toEqual([1, 2, 3]);
  });

  it('throws for a value that was never registered', () => {
    expect(() => getRawBuffer({})).toThrow('getRawBuffer: not a registered J2OCL array instance');
  });
});
