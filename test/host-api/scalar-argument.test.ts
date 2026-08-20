/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Int8 } from '../../src/types/scalar/int8.js';
import { UInt8 } from '../../src/types/scalar/uint8.js';
import { Int16 } from '../../src/types/scalar/int16.js';
import { UInt16 } from '../../src/types/scalar/uint16.js';
import { Int32 } from '../../src/types/scalar/int32.js';
import { UInt32 } from '../../src/types/scalar/uint32.js';
import { Int64 } from '../../src/types/scalar/int64.js';
import { UInt64 } from '../../src/types/scalar/uint64.js';
import { Float32 } from '../../src/types/scalar/float32.js';
import { Float64 } from '../../src/types/scalar/float64.js';
import { Bool } from '../../src/types/scalar/bool.js';
import { scalarArgOf } from '../../src/host-api/arguments/scalar-argument.js';

describe('scalarArgOf', () => {
  it.each([
    [Int8.of(1), 'char'],
    [UInt8.of(1), 'uchar'],
    [Int16.of(1), 'short'],
    [UInt16.of(1), 'ushort'],
    [Int32.of(1), 'int'],
    [UInt32.of(1), 'uint'],
    [Int64.of(1n), 'long'],
    [UInt64.of(1n), 'ulong'],
    [Float32.of(1), 'float'],
    [Float64.of(1), 'double'],
    [Bool.of(true), 'bool'],
  ] as const)('resolves %#', (value, expectedCType) => {
    expect(scalarArgOf(value).cType).toBe(expectedCType);
  });

  it('throws for a non-scalar value', () => {
    expect(() => scalarArgOf({} as never)).toThrow('scalarArgOf: not a J2OCL scalar instance');
  });

  it('converts an in-range Int64/UInt64 to a plain number', () => {
    expect(scalarArgOf(Int64.of(1234567890123n)).raw).toBe(1234567890123);
    expect(scalarArgOf(UInt64.of(9876543210987n)).raw).toBe(9876543210987);
  });

  it('throws for an Int64/UInt64 outside the safe integer range', () => {
    const tooLarge = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    expect(() => scalarArgOf(Int64.of(tooLarge))).toThrow(/outside the JS safe integer range/);
    const tooSmall = BigInt(Number.MIN_SAFE_INTEGER) - 1n;
    expect(() => scalarArgOf(Int64.of(tooSmall))).toThrow(/outside the JS safe integer range/);
  });
});
