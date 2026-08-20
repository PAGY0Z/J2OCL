/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { CharArray } from '../../types/array/char-array.js';
import { UCharArray } from '../../types/array/uchar-array.js';
import { ShortArray } from '../../types/array/short-array.js';
import { UShortArray } from '../../types/array/ushort-array.js';
import { IntArray } from '../../types/array/int-array.js';
import { UIntArray } from '../../types/array/uint-array.js';
import { LongArray } from '../../types/array/long-array.js';
import { ULongArray } from '../../types/array/ulong-array.js';
import { FloatArray } from '../../types/array/float-array.js';
import { DoubleArray } from '../../types/array/double-array.js';

export type AnyJ2OCLArray = CharArray | UCharArray | ShortArray | UShortArray | IntArray | UIntArray | LongArray | ULongArray | FloatArray | DoubleArray;

export function elementCTypeOf(array: AnyJ2OCLArray): string {
  if (array instanceof CharArray) return 'char';
  if (array instanceof UCharArray) return 'uchar';
  if (array instanceof ShortArray) return 'short';
  if (array instanceof UShortArray) return 'ushort';
  if (array instanceof IntArray) return 'int';
  if (array instanceof UIntArray) return 'uint';
  if (array instanceof LongArray) return 'long';
  if (array instanceof ULongArray) return 'ulong';
  if (array instanceof FloatArray) return 'float';
  if (array instanceof DoubleArray) return 'double';
  throw new Error('elementCTypeOf: not a J2OCL array instance');
}

export function isAnyJ2OCLArray(value: unknown): value is AnyJ2OCLArray {
  return value instanceof CharArray || value instanceof UCharArray || value instanceof ShortArray || value instanceof UShortArray || value instanceof IntArray || value instanceof UIntArray || value instanceof LongArray || value instanceof ULongArray || value instanceof FloatArray || value instanceof DoubleArray;
}
