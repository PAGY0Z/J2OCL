/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { parameterCType, scalarCType } from '../../src/compiler/type-mapping.js';

describe('scalarCType', () => {
  it('maps every scalar type to its OpenCL C equivalent', () => {
    expect(scalarCType('Int8')).toBe('char');
    expect(scalarCType('UInt8')).toBe('uchar');
    expect(scalarCType('Int16')).toBe('short');
    expect(scalarCType('UInt16')).toBe('ushort');
    expect(scalarCType('Int32')).toBe('int');
    expect(scalarCType('UInt32')).toBe('uint');
    expect(scalarCType('Int64')).toBe('long');
    expect(scalarCType('UInt64')).toBe('ulong');
    expect(scalarCType('Float32')).toBe('float');
    expect(scalarCType('Float64')).toBe('double');
    expect(scalarCType('Bool')).toBe('bool');
  });

  it('maps void to void', () => {
    expect(scalarCType('void')).toBe('void');
  });

  it('throws for an array type, which has no scalar C representation', () => {
    expect(() => scalarCType('FloatArray')).toThrow(/not a scalar/);
  });
});

describe('parameterCType', () => {
  it('maps a scalar parameter type to its plain C type', () => {
    expect(parameterCType('Float32')).toBe('float');
    expect(parameterCType('UInt32')).toBe('uint');
  });

  it('maps an array parameter type to a __global pointer to its element type', () => {
    expect(parameterCType('FloatArray')).toBe('__global float*');
    expect(parameterCType('IntArray')).toBe('__global int*');
    expect(parameterCType('UCharArray')).toBe('__global uchar*');
  });
});
