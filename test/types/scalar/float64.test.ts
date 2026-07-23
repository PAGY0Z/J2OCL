/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Float64 } from '../../../src/types/scalar/float64.js';

describe('Float64', () => {
  it('keeps full 64-bit precision, unlike Float32', () => {
    expect(Float64.of(0.1).valueOf()).toBe(0.1);
  });

  it('adds two values with no extra rounding', () => {
    expect(Float64.of(1).add(Float64.of(2))).toEqual(Float64.of(3));
  });

  it('subtracts', () => {
    expect(Float64.of(5).sub(Float64.of(3))).toEqual(Float64.of(2));
  });

  it('multiplies', () => {
    expect(Float64.of(5).mul(Float64.of(3))).toEqual(Float64.of(15));
  });

  it('divides using real IEEE-754 division — never throws, unlike integer division', () => {
    expect(Float64.of(7).div(Float64.of(2))).toEqual(Float64.of(3.5));
    expect(Float64.of(1).div(Float64.of(0)).valueOf()).toBe(Infinity);
    expect(Float64.of(-1).div(Float64.of(0)).valueOf()).toBe(-Infinity);
    expect(Float64.of(0).div(Float64.of(0)).valueOf()).toBeNaN();
  });

  it('has no mod() — modulo is integer-only in OpenCL C', () => {
    expect((Float64.of(1) as unknown as { mod?: unknown }).mod).toBeUndefined();
  });

  it('negates', () => {
    expect(Float64.of(5).negate()).toEqual(Float64.of(-5));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Float64.of(5).greaterThan(Float64.of(3))).toEqual(Bool.of(true));
    expect(Float64.of(3).lessThan(Float64.of(5))).toEqual(Bool.of(true));
    expect(Float64.of(5).greaterThanOrEqual(Float64.of(5))).toEqual(
      Bool.of(true),
    );
    expect(Float64.of(5).lessThanOrEqual(Float64.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Float64.of(5).equals(Float64.of(5))).toEqual(Bool.of(true));
    expect(Float64.of(5).notEquals(Float64.of(3))).toEqual(Bool.of(true));
  });
});
