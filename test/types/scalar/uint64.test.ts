/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { UInt64 } from '../../../src/types/scalar/uint64.js';

describe('UInt64', () => {
  it('adds two values normally, within range', () => {
    expect(UInt64.of(2n).add(UInt64.of(3n))).toEqual(UInt64.of(5n));
  });

  it('wraps around like a C uint64_t on overflow', () => {
    expect(UInt64.of(18446744073709551615n).add(UInt64.of(1n))).toEqual(
      UInt64.of(0n),
    );
  });

  it('subtracts, wrapping around on underflow like a C uint64_t', () => {
    expect(UInt64.of(5n).sub(UInt64.of(3n))).toEqual(UInt64.of(2n));
    expect(UInt64.of(0n).sub(UInt64.of(1n))).toEqual(
      UInt64.of(18446744073709551615n),
    );
  });

  it('multiplies, wrapping around on overflow like a C uint64_t', () => {
    expect(UInt64.of(5n).mul(UInt64.of(3n))).toEqual(UInt64.of(15n));
    expect(UInt64.of(18446744073709551615n).mul(UInt64.of(2n))).toEqual(
      UInt64.of(18446744073709551614n),
    );
  });

  it('divides, truncating toward zero', () => {
    expect(UInt64.of(7n).div(UInt64.of(2n))).toEqual(UInt64.of(3n));
  });

  it('throws when dividing by zero', () => {
    expect(() => UInt64.of(1n).div(UInt64.of(0n))).toThrow(/division by zero/);
  });

  it('takes the remainder', () => {
    expect(UInt64.of(7n).mod(UInt64.of(2n))).toEqual(UInt64.of(1n));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => UInt64.of(1n).mod(UInt64.of(0n))).toThrow(/division by zero/);
  });

  it('negates, wrapping unsigned values via modular arithmetic', () => {
    expect(UInt64.of(5n).negate()).toEqual(UInt64.of(-5n));
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(UInt64.of(5n).greaterThan(UInt64.of(3n))).toEqual(Bool.of(true));
    expect(UInt64.of(3n).lessThan(UInt64.of(5n))).toEqual(Bool.of(true));
    expect(UInt64.of(5n).greaterThanOrEqual(UInt64.of(5n))).toEqual(
      Bool.of(true),
    );
    expect(UInt64.of(5n).lessThanOrEqual(UInt64.of(5n))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(UInt64.of(5n).equals(UInt64.of(5n))).toEqual(Bool.of(true));
    expect(UInt64.of(5n).notEquals(UInt64.of(3n))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(UInt64.of(12n).bitwiseAnd(UInt64.of(10n))).toEqual(UInt64.of(8n));
    expect(UInt64.of(12n).bitwiseOr(UInt64.of(10n))).toEqual(UInt64.of(14n));
    expect(UInt64.of(12n).bitwiseXor(UInt64.of(10n))).toEqual(UInt64.of(6n));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(UInt64.of(5n).bitwiseNot()).toEqual(
      UInt64.of(18446744073709551610n),
    );
  });

  it('shifts left, wrapping around on overflow like a C uint64_t', () => {
    expect(UInt64.of(1n).shiftLeft(UInt64.of(3n))).toEqual(UInt64.of(8n));
    expect(UInt64.of(9223372036854775808n).shiftLeft(UInt64.of(1n))).toEqual(
      UInt64.of(0n),
    );
  });

  it('shifts right logically, filling with zeros — unlike an arithmetic shift, which would keep this value unchanged', () => {
    expect(UInt64.of(18446744073709551615n).shiftRight(UInt64.of(1n))).toEqual(
      UInt64.of(9223372036854775807n),
    );
  });
});
