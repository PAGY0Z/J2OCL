/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Int32 } from '../../../src/types/scalar/int32.js';

describe('Int32', () => {
  it('adds two values normally, within range', () => {
    expect(Int32.of(2).add(Int32.of(3))).toEqual(Int32.of(5));
  });

  it('wraps around like a C int32_t on overflow', () => {
    expect(Int32.of(2147483647).add(Int32.of(1))).toEqual(
      Int32.of(-2147483648),
    );
  });

  it('subtracts, wrapping around on underflow like a C int32_t', () => {
    expect(Int32.of(5).sub(Int32.of(3))).toEqual(Int32.of(2));
    expect(Int32.of(-2147483648).sub(Int32.of(1))).toEqual(
      Int32.of(2147483647),
    );
  });

  it('multiplies, wrapping around on overflow like a C int32_t', () => {
    expect(Int32.of(5).mul(Int32.of(3))).toEqual(Int32.of(15));
    expect(Int32.of(2000000000).mul(Int32.of(2))).toEqual(Int32.of(-294967296));
  });

  it('divides, truncating toward zero', () => {
    expect(Int32.of(7).div(Int32.of(2))).toEqual(Int32.of(3));
    expect(Int32.of(-7).div(Int32.of(2))).toEqual(Int32.of(-3));
  });

  it('throws when dividing by zero', () => {
    expect(() => Int32.of(1).div(Int32.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder, with the sign of the dividend', () => {
    expect(Int32.of(7).mod(Int32.of(2))).toEqual(Int32.of(1));
    expect(Int32.of(-7).mod(Int32.of(2))).toEqual(Int32.of(-1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => Int32.of(1).mod(Int32.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping the most negative value back to itself', () => {
    expect(Int32.of(5).negate()).toEqual(Int32.of(-5));
    expect(Int32.of(-2147483648).negate()).toEqual(Int32.of(-2147483648));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Int32.of(5).greaterThan(Int32.of(3))).toEqual(Bool.of(true));
    expect(Int32.of(3).lessThan(Int32.of(5))).toEqual(Bool.of(true));
    expect(Int32.of(5).greaterThanOrEqual(Int32.of(5))).toEqual(Bool.of(true));
    expect(Int32.of(5).lessThanOrEqual(Int32.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Int32.of(5).equals(Int32.of(5))).toEqual(Bool.of(true));
    expect(Int32.of(5).notEquals(Int32.of(3))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(Int32.of(12).bitwiseAnd(Int32.of(10))).toEqual(Int32.of(8));
    expect(Int32.of(12).bitwiseOr(Int32.of(10))).toEqual(Int32.of(14));
    expect(Int32.of(12).bitwiseXor(Int32.of(10))).toEqual(Int32.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(Int32.of(5).bitwiseNot()).toEqual(Int32.of(-6));
  });

  it('shifts left, wrapping around on overflow like a C int32_t', () => {
    expect(Int32.of(1).shiftLeft(Int32.of(3))).toEqual(Int32.of(8));
    expect(Int32.of(1073741824).shiftLeft(Int32.of(2))).toEqual(Int32.of(0));
  });

  it('shifts right arithmetically, preserving the sign', () => {
    expect(Int32.of(-8).shiftRight(Int32.of(1))).toEqual(Int32.of(-4));
  });
});
