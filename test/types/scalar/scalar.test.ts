/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Scalar } from '../../../src/types/scalar/scalar.js';

class TestScalar extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): TestScalar {
    return new TestScalar(raw);
  }

  protected wrap(raw: number): number {
    return raw * 2;
  }
}

describe('Scalar', () => {
  it('runs wrap() on the raw value once, during construction', () => {
    expect(TestScalar.of(5).valueOf()).toBe(10);
  });

  it('exposes the wrapped value through valueOf()', () => {
    expect(TestScalar.of(3).valueOf()).toBe(6);
  });
});
