/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { UInt8 } from '../../../src/types/scalar/uint8.js';

describe('UInt8', () => {
  it('adds two values normally, within range', () => {
    expect(UInt8.of(2).add(UInt8.of(3))).toEqual(UInt8.of(5));
  });

  it('wraps around like a C uint8_t on overflow', () => {
    expect(UInt8.of(255).add(UInt8.of(1))).toEqual(UInt8.of(0));
  });

  it('subtracts, wrapping around on underflow like a C uint8_t', () => {
    expect(UInt8.of(5).sub(UInt8.of(3))).toEqual(UInt8.of(2));
    expect(UInt8.of(0).sub(UInt8.of(1))).toEqual(UInt8.of(255));
  });

  it('multiplies, wrapping around on overflow like a C uint8_t', () => {
    expect(UInt8.of(5).mul(UInt8.of(3))).toEqual(UInt8.of(15));
    expect(UInt8.of(100).mul(UInt8.of(3))).toEqual(UInt8.of(44));
  });

  it('divides, truncating toward zero', () => {
    expect(UInt8.of(7).div(UInt8.of(2))).toEqual(UInt8.of(3));
  });

  it('throws when dividing by zero', () => {
    expect(() => UInt8.of(1).div(UInt8.of(0))).toThrow(/division by zero/);
  });

  it('takes the remainder', () => {
    expect(UInt8.of(7).mod(UInt8.of(2))).toEqual(UInt8.of(1));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => UInt8.of(1).mod(UInt8.of(0))).toThrow(/division by zero/);
  });

  it('negates, wrapping unsigned values via modular arithmetic', () => {
    expect(UInt8.of(5).negate()).toEqual(UInt8.of(-5));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(UInt8.of(5).greaterThan(UInt8.of(3))).toEqual(Bool.of(true));
    expect(UInt8.of(3).lessThan(UInt8.of(5))).toEqual(Bool.of(true));
    expect(UInt8.of(5).greaterThanOrEqual(UInt8.of(5))).toEqual(Bool.of(true));
    expect(UInt8.of(5).lessThanOrEqual(UInt8.of(5))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(UInt8.of(5).equals(UInt8.of(5))).toEqual(Bool.of(true));
    expect(UInt8.of(5).notEquals(UInt8.of(3))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(UInt8.of(12).bitwiseAnd(UInt8.of(10))).toEqual(UInt8.of(8));
    expect(UInt8.of(12).bitwiseOr(UInt8.of(10))).toEqual(UInt8.of(14));
    expect(UInt8.of(12).bitwiseXor(UInt8.of(10))).toEqual(UInt8.of(6));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(UInt8.of(5).bitwiseNot()).toEqual(UInt8.of(250));
  });

  it('shifts left, wrapping around on overflow like a C uint8_t', () => {
    expect(UInt8.of(1).shiftLeft(UInt8.of(3))).toEqual(UInt8.of(8));
    expect(UInt8.of(64).shiftLeft(UInt8.of(2))).toEqual(UInt8.of(0));
  });

  it('shifts right logically, filling with zeros', () => {
    expect(UInt8.of(200).shiftRight(UInt8.of(1))).toEqual(UInt8.of(100));
  });
});
