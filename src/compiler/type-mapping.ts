/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { J2OCLArrayType, J2OCLType } from './j2ocl-type.js';

const SCALAR_C_TYPES: Partial<Record<J2OCLType, string>> = {
  Int8: 'char',
  UInt8: 'uchar',
  Int16: 'short',
  UInt16: 'ushort',
  Int32: 'int',
  UInt32: 'uint',
  Int64: 'long',
  UInt64: 'ulong',
  Float32: 'float',
  Float64: 'double',
  Bool: 'bool',
  void: 'void',
};

const ARRAY_ELEMENT_C_TYPES: Record<J2OCLArrayType, string> = {
  CharArray: 'char',
  UCharArray: 'uchar',
  ShortArray: 'short',
  UShortArray: 'ushort',
  IntArray: 'int',
  UIntArray: 'uint',
  LongArray: 'long',
  ULongArray: 'ulong',
  FloatArray: 'float',
  DoubleArray: 'double',
};

export function scalarCType(type: J2OCLType): string {
  const cType = SCALAR_C_TYPES[type];
  if (cType === undefined) {
    throw new Error(`scalarCType: "${type}" is not a scalar type`);
  }
  return cType;
}

export function parameterCType(type: J2OCLType): string {
  const arrayElementType = ARRAY_ELEMENT_C_TYPES[type as J2OCLArrayType];
  if (arrayElementType !== undefined) {
    return `__global ${arrayElementType}*`;
  }
  return scalarCType(type);
}
