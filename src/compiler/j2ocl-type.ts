/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

export type J2OCLScalarType = 'Int8' | 'UInt8' | 'Int16' | 'UInt16' | 'Int32' | 'UInt32' | 'Int64' | 'UInt64' | 'Float32' | 'Float64' | 'Bool';

export type J2OCLArrayType = 'CharArray' | 'UCharArray' | 'ShortArray' | 'UShortArray' | 'IntArray' | 'UIntArray' | 'LongArray' | 'ULongArray' | 'FloatArray' | 'DoubleArray';

export type J2OCLType = J2OCLScalarType | J2OCLArrayType | 'void';
