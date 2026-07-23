/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { UInt16 } from '../../../src/types/scalar/uint16.js';

describe('UInt16', () => {
  it('adds two values normally, within range', () => {
    expect(UInt16.of(2).add(UInt16.of(3))).toEqual(UInt16.of(5));
  });

  it('wraps around like a C uint16_t on overflow', () => {
    expect(UInt16.of(65535).add(UInt16.of(1))).toEqual(UInt16.of(0));
  });

  it('subtracts, wrapping around on underflow like a C uint16_t', () => {
    expect(UInt16.of(5).sub(UInt16.of(3))).toEqual(UInt16.of(2));
    expect(UInt16.of(0).sub(UInt16.of(1))).toEqual(UInt16.of(65535));
  });

  it('multiplies, wrapping around on overflow like a C uint16_t', () => {
    expect(UInt16.of(5).mul(UInt16.of(3))).toEqual(UInt16.of(15));
    expect(UInt16.of(40000).mul(UInt16.of(3))).toEqual(UInt16.of(54464));
  });

  it('divides, truncating toward zero', () => {
    expect(UInt16.of(7).div(UInt16.of(2))).toEqual(UInt16.of(3));
  });

  it('throws when dividing by zero', () => {
    expect(() => UInt16.of(1).div(UInt16.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder', () => {
    expect(UInt16.of(7).mod(UInt16.of(2))).toEqual(UInt16.of(1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => UInt16.of(1).mod(UInt16.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping unsigned values via modular arithmetic', () => {
    expect(UInt16.of(5).negate()).toEqual(UInt16.of(-5));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(UInt16.of(5).greaterThan(UInt16.of(3))).toEqual(Bool.of(true));
    expect(UInt16.of(3).lessThan(UInt16.of(5))).toEqual(Bool.of(true));
    expect(UInt16.of(5).greaterThanOrEqual(UInt16.of(5))).toEqual(
      Bool.of(true),
    );
    expect(UInt16.of(5).lessThanOrEqual(UInt16.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(UInt16.of(5).equals(UInt16.of(5))).toEqual(Bool.of(true));
    expect(UInt16.of(5).notEquals(UInt16.of(3))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(UInt16.of(12).bitwiseAnd(UInt16.of(10))).toEqual(UInt16.of(8));
    expect(UInt16.of(12).bitwiseOr(UInt16.of(10))).toEqual(UInt16.of(14));
    expect(UInt16.of(12).bitwiseXor(UInt16.of(10))).toEqual(UInt16.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(UInt16.of(5).bitwiseNot()).toEqual(UInt16.of(65530));
  });

  it('shifts left, wrapping around on overflow like a C uint16_t', () => {
    expect(UInt16.of(1).shiftLeft(UInt16.of(3))).toEqual(UInt16.of(8));
    expect(UInt16.of(16384).shiftLeft(UInt16.of(2))).toEqual(UInt16.of(0));
  });

  it('shifts right logically, filling with zeros', () => {
    expect(UInt16.of(200).shiftRight(UInt16.of(1))).toEqual(UInt16.of(100));
  });
});
