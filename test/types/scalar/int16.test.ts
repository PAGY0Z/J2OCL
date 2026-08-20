/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Int16 } from '../../../src/types/scalar/int16.js';

describe('Int16', () => {
  it('adds two values normally, within range', () => {
    expect(Int16.of(2).add(Int16.of(3))).toEqual(Int16.of(5));
  });

  it('wraps around like a C int16_t on overflow', () => {
    expect(Int16.of(32767).add(Int16.of(1))).toEqual(Int16.of(-32768));
  });

  it('subtracts, wrapping around on underflow like a C int16_t', () => {
    expect(Int16.of(5).sub(Int16.of(3))).toEqual(Int16.of(2));
    expect(Int16.of(-32768).sub(Int16.of(1))).toEqual(Int16.of(32767));
  });

  it('multiplies, wrapping around on overflow like a C int16_t', () => {
    expect(Int16.of(5).mul(Int16.of(3))).toEqual(Int16.of(15));
    expect(Int16.of(20000).mul(Int16.of(2))).toEqual(Int16.of(-25536));
  });

  it('divides, truncating toward zero', () => {
    expect(Int16.of(7).div(Int16.of(2))).toEqual(Int16.of(3));
    expect(Int16.of(-7).div(Int16.of(2))).toEqual(Int16.of(-3));
  });

  it('throws when dividing by zero', () => {
    expect(() => Int16.of(1).div(Int16.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder, with the sign of the dividend', () => {
    expect(Int16.of(7).mod(Int16.of(2))).toEqual(Int16.of(1));
    expect(Int16.of(-7).mod(Int16.of(2))).toEqual(Int16.of(-1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => Int16.of(1).mod(Int16.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping the most negative value back to itself', () => {
    expect(Int16.of(5).negate()).toEqual(Int16.of(-5));
    expect(Int16.of(-32768).negate()).toEqual(Int16.of(-32768));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Int16.of(5).greaterThan(Int16.of(3))).toEqual(Bool.of(true));
    expect(Int16.of(3).lessThan(Int16.of(5))).toEqual(Bool.of(true));
    expect(Int16.of(5).greaterThanOrEqual(Int16.of(5))).toEqual(Bool.of(true));
    expect(Int16.of(5).lessThanOrEqual(Int16.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Int16.of(5).equals(Int16.of(5))).toEqual(Bool.of(true));
    expect(Int16.of(5).notEquals(Int16.of(3))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(Int16.of(12).bitwiseAnd(Int16.of(10))).toEqual(Int16.of(8));
    expect(Int16.of(12).bitwiseOr(Int16.of(10))).toEqual(Int16.of(14));
    expect(Int16.of(12).bitwiseXor(Int16.of(10))).toEqual(Int16.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(Int16.of(5).bitwiseNot()).toEqual(Int16.of(-6));
  });

  it('shifts left, wrapping around on overflow like a C int16_t', () => {
    expect(Int16.of(1).shiftLeft(Int16.of(3))).toEqual(Int16.of(8));
    expect(Int16.of(16384).shiftLeft(Int16.of(2))).toEqual(Int16.of(0));
  });

  it('shifts right arithmetically, preserving the sign', () => {
    expect(Int16.of(-8).shiftRight(Int16.of(1))).toEqual(Int16.of(-4));
  });
});
