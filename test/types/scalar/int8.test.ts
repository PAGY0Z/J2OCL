/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Int8 } from '../../../src/types/scalar/int8.js';

describe('Int8', () => {
  it('adds two values normally, within range', () => {
    expect(Int8.of(2).add(Int8.of(3))).toEqual(Int8.of(5));
  });

  it('wraps around like a C int8_t on overflow', () => {
    expect(Int8.of(127).add(Int8.of(1))).toEqual(Int8.of(-128));
  });

  it('subtracts, wrapping around on underflow like a C int8_t', () => {
    expect(Int8.of(5).sub(Int8.of(3))).toEqual(Int8.of(2));
    expect(Int8.of(-128).sub(Int8.of(1))).toEqual(Int8.of(127));
  });

  it('multiplies, wrapping around on overflow like a C int8_t', () => {
    expect(Int8.of(5).mul(Int8.of(3))).toEqual(Int8.of(15));
    expect(Int8.of(100).mul(Int8.of(2))).toEqual(Int8.of(-56));
  });

  it('divides, truncating toward zero like C integer division', () => {
    expect(Int8.of(7).div(Int8.of(2))).toEqual(Int8.of(3));
    expect(Int8.of(-7).div(Int8.of(2))).toEqual(Int8.of(-3));
  });

  it('throws when dividing by zero', () => {
    expect(() => Int8.of(1).div(Int8.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder, with the sign of the dividend like C %', () => {
    expect(Int8.of(7).mod(Int8.of(2))).toEqual(Int8.of(1));
    expect(Int8.of(-7).mod(Int8.of(2))).toEqual(Int8.of(-1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => Int8.of(1).mod(Int8.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping the most negative value back to itself', () => {
    expect(Int8.of(5).negate()).toEqual(Int8.of(-5));
    expect(Int8.of(-128).negate()).toEqual(Int8.of(-128));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Int8.of(5).greaterThan(Int8.of(3))).toEqual(Bool.of(true));
    expect(Int8.of(3).greaterThan(Int8.of(5))).toEqual(Bool.of(false));
    expect(Int8.of(3).lessThan(Int8.of(5))).toEqual(Bool.of(true));
    expect(Int8.of(5).greaterThanOrEqual(Int8.of(5))).toEqual(Bool.of(true));
    expect(Int8.of(5).lessThanOrEqual(Int8.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Int8.of(5).equals(Int8.of(5))).toEqual(Bool.of(true));
    expect(Int8.of(5).equals(Int8.of(3))).toEqual(Bool.of(false));
    expect(Int8.of(5).notEquals(Int8.of(3))).toEqual(Bool.of(true));
    expect(Int8.of(5).notEquals(Int8.of(5))).toEqual(Bool.of(false));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(Int8.of(12).bitwiseAnd(Int8.of(10))).toEqual(Int8.of(8));
    expect(Int8.of(12).bitwiseOr(Int8.of(10))).toEqual(Int8.of(14));
    expect(Int8.of(12).bitwiseXor(Int8.of(10))).toEqual(Int8.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(Int8.of(5).bitwiseNot()).toEqual(Int8.of(-6));
  });

  it('shifts left, wrapping around on overflow like a C int8_t', () => {
    expect(Int8.of(1).shiftLeft(Int8.of(3))).toEqual(Int8.of(8));
    expect(Int8.of(64).shiftLeft(Int8.of(2))).toEqual(Int8.of(0));
  });

  it('shifts right arithmetically, preserving the sign', () => {
    expect(Int8.of(-8).shiftRight(Int8.of(1))).toEqual(Int8.of(-4));
  });
});
