/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Float32 } from '../../../src/types/scalar/float32.js';

describe('Float32', () => {
  it('rounds to 32-bit float precision, unlike a plain JS number', () => {
    expect(Float32.of(0.1).valueOf()).toBe(Math.fround(0.1));
    expect(Float32.of(0.1).valueOf()).not.toBe(0.1);
  });

  it('adds two values, rounding the result to 32-bit float precision', () => {
    expect(Float32.of(1).add(Float32.of(2))).toEqual(Float32.of(3));
  });

  it('subtracts, rounding the result to 32-bit float precision', () => {
    expect(Float32.of(5).sub(Float32.of(3))).toEqual(Float32.of(2));
  });

  it('multiplies, rounding the result to 32-bit float precision', () => {
    expect(Float32.of(5).mul(Float32.of(3))).toEqual(Float32.of(15));
  });

  it('divides using real IEEE-754 division — never throws, unlike integer division', () => {
    expect(Float32.of(7).div(Float32.of(2))).toEqual(Float32.of(3.5));
    expect(Float32.of(1).div(Float32.of(0)).valueOf()).toBe(Infinity);
    expect(Float32.of(-1).div(Float32.of(0)).valueOf()).toBe(-Infinity);
    expect(Float32.of(0).div(Float32.of(0)).valueOf()).toBeNaN();
  });

  it('has no mod() — modulo is integer-only in OpenCL C', () => {
    expect((Float32.of(1) as unknown as { mod?: unknown }).mod).toBeUndefined();
  });

  it('negates', () => {
    expect(Float32.of(5).negate()).toEqual(Float32.of(-5));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Float32.of(5).greaterThan(Float32.of(3))).toEqual(Bool.of(true));
    expect(Float32.of(3).lessThan(Float32.of(5))).toEqual(Bool.of(true));
    expect(Float32.of(5).greaterThanOrEqual(Float32.of(5))).toEqual(
      Bool.of(true),
    );
    expect(Float32.of(5).lessThanOrEqual(Float32.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Float32.of(5).equals(Float32.of(5))).toEqual(Bool.of(true));
    expect(Float32.of(5).notEquals(Float32.of(3))).toEqual(Bool.of(true));
  });
});
