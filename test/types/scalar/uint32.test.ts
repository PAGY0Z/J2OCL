/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { UInt32 } from '../../../src/types/scalar/uint32.js';

describe('UInt32', () => {
  it('adds two values normally, within range', () => {
    expect(UInt32.of(2).add(UInt32.of(3))).toEqual(UInt32.of(5));
  });

  it('wraps around like a C uint32_t on overflow', () => {
    expect(UInt32.of(4294967295).add(UInt32.of(1))).toEqual(UInt32.of(0));
  });

  it('subtracts, wrapping around on underflow like a C uint32_t', () => {
    expect(UInt32.of(5).sub(UInt32.of(3))).toEqual(UInt32.of(2));
    expect(UInt32.of(0).sub(UInt32.of(1))).toEqual(UInt32.of(4294967295));
  });

  it('multiplies, wrapping around on overflow like a C uint32_t', () => {
    expect(UInt32.of(5).mul(UInt32.of(3))).toEqual(UInt32.of(15));
    expect(UInt32.of(3000000000).mul(UInt32.of(2))).toEqual(
      UInt32.of(1705032704),
    );
  });

  it('divides, truncating toward zero', () => {
    expect(UInt32.of(7).div(UInt32.of(2))).toEqual(UInt32.of(3));
  });

  it('throws when dividing by zero', () => {
    expect(() => UInt32.of(1).div(UInt32.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder', () => {
    expect(UInt32.of(7).mod(UInt32.of(2))).toEqual(UInt32.of(1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => UInt32.of(1).mod(UInt32.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping unsigned values via modular arithmetic', () => {
    expect(UInt32.of(5).negate()).toEqual(UInt32.of(-5));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(UInt32.of(5).greaterThan(UInt32.of(3))).toEqual(Bool.of(true));
    expect(UInt32.of(3).lessThan(UInt32.of(5))).toEqual(Bool.of(true));
    expect(UInt32.of(5).greaterThanOrEqual(UInt32.of(5))).toEqual(
      Bool.of(true),
    );
    expect(UInt32.of(5).lessThanOrEqual(UInt32.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(UInt32.of(5).equals(UInt32.of(5))).toEqual(Bool.of(true));
    expect(UInt32.of(5).notEquals(UInt32.of(3))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(UInt32.of(12).bitwiseAnd(UInt32.of(10))).toEqual(UInt32.of(8));
    expect(UInt32.of(12).bitwiseOr(UInt32.of(10))).toEqual(UInt32.of(14));
    expect(UInt32.of(12).bitwiseXor(UInt32.of(10))).toEqual(UInt32.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(UInt32.of(5).bitwiseNot()).toEqual(UInt32.of(4294967290));
  });

  it('shifts left, wrapping around on overflow like a C uint32_t', () => {
    expect(UInt32.of(1).shiftLeft(UInt32.of(3))).toEqual(UInt32.of(8));
    expect(UInt32.of(2147483648).shiftLeft(UInt32.of(1))).toEqual(UInt32.of(0));
  });

  it('shifts right logically, filling with zeros — unlike an arithmetic shift, which would keep this value unchanged', () => {
    expect(UInt32.of(4294967295).shiftRight(UInt32.of(1))).toEqual(
      UInt32.of(2147483647),
    );
  });
});
