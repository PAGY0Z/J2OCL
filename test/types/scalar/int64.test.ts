/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';
import { Int64 } from '../../../src/types/scalar/int64.js';

describe('Int64', () => {
  it('adds two values normally, within range', () => {
    expect(Int64.of(2n).add(Int64.of(3n))).toEqual(Int64.of(5n));
  });

  it('wraps around like a C int64_t on overflow', () => {
    expect(Int64.of(9223372036854775807n).add(Int64.of(1n))).toEqual(
      Int64.of(-9223372036854775808n),
    );
  });

  it('subtracts, wrapping around on underflow like a C int64_t', () => {
    expect(Int64.of(5n).sub(Int64.of(3n))).toEqual(Int64.of(2n));
    expect(Int64.of(-9223372036854775808n).sub(Int64.of(1n))).toEqual(
      Int64.of(9223372036854775807n),
    );
  });

  it('multiplies, wrapping around on overflow like a C int64_t', () => {
    expect(Int64.of(5n).mul(Int64.of(3n))).toEqual(Int64.of(15n));
    expect(Int64.of(9223372036854775807n).mul(Int64.of(2n))).toEqual(
      Int64.of(-2n),
    );
  });

  it('divides, truncating toward zero (native bigint division already does this)', () => {
    expect(Int64.of(7n).div(Int64.of(2n))).toEqual(Int64.of(3n));
    expect(Int64.of(-7n).div(Int64.of(2n))).toEqual(Int64.of(-3n));
  });

  it('throws when dividing by zero', () => {
    expect(() => Int64.of(1n).div(Int64.of(0n))).toThrow(/division by zero/);
  });

  it('takes the remainder, with the sign of the dividend', () => {
    expect(Int64.of(7n).mod(Int64.of(2n))).toEqual(Int64.of(1n));
    expect(Int64.of(-7n).mod(Int64.of(2n))).toEqual(Int64.of(-1n));
  });

  it('throws when taking the remainder of division by zero', () => {
    expect(() => Int64.of(1n).mod(Int64.of(0n))).toThrow(/division by zero/);
  });

  it('negates, wrapping the most negative value back to itself', () => {
    expect(Int64.of(5n).negate()).toEqual(Int64.of(-5n));
    expect(Int64.of(-9223372036854775808n).negate()).toEqual(
      Int64.of(-9223372036854775808n),
    );
  });

  it('compares with greaterThan/lessThan/greaterThanOrEqual/lessThanOrEqual', () => {
    expect(Int64.of(5n).greaterThan(Int64.of(3n))).toEqual(Bool.of(true));
    expect(Int64.of(3n).lessThan(Int64.of(5n))).toEqual(Bool.of(true));
    expect(Int64.of(5n).greaterThanOrEqual(Int64.of(5n))).toEqual(
      Bool.of(true),
    );
    expect(Int64.of(5n).lessThanOrEqual(Int64.of(5n))).toEqual(Bool.of(true));
  });

  it('compares with equals/notEquals', () => {
    expect(Int64.of(5n).equals(Int64.of(5n))).toEqual(Bool.of(true));
    expect(Int64.of(5n).notEquals(Int64.of(3n))).toEqual(Bool.of(true));
  });

  it('combines with bitwiseAnd/bitwiseOr/bitwiseXor', () => {
    expect(Int64.of(12n).bitwiseAnd(Int64.of(10n))).toEqual(Int64.of(8n));
    expect(Int64.of(12n).bitwiseOr(Int64.of(10n))).toEqual(Int64.of(14n));
    expect(Int64.of(12n).bitwiseXor(Int64.of(10n))).toEqual(Int64.of(6n));
  });

  it('flips every bit with bitwiseNot', () => {
    expect(Int64.of(5n).bitwiseNot()).toEqual(Int64.of(-6n));
  });

  it('shifts left, wrapping around on overflow like a C int64_t', () => {
    expect(Int64.of(1n).shiftLeft(Int64.of(3n))).toEqual(Int64.of(8n));
    expect(Int64.of(4611686018427387904n).shiftLeft(Int64.of(2n))).toEqual(
      Int64.of(0n),
    );
  });

  it('shifts right arithmetically, preserving the sign', () => {
    expect(Int64.of(-8n).shiftRight(Int64.of(1n))).toEqual(Int64.of(-4n));
  });
});
