/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int8 } from '../../types/scalar/int8.js';
import { UInt8 } from '../../types/scalar/uint8.js';
import { Int16 } from '../../types/scalar/int16.js';
import { UInt16 } from '../../types/scalar/uint16.js';
import { Int32 } from '../../types/scalar/int32.js';
import { UInt32 } from '../../types/scalar/uint32.js';
import { Int64 } from '../../types/scalar/int64.js';
import { UInt64 } from '../../types/scalar/uint64.js';
import { Float32 } from '../../types/scalar/float32.js';
import { Float64 } from '../../types/scalar/float64.js';
import { Bool } from '../../types/scalar/bool.js';

export type ScalarArgument = Int8 | UInt8 | Int16 | UInt16 | Int32 | UInt32 | Int64 | UInt64 | Float32 | Float64 | Bool;

function toSafeNumber(raw: bigint): number
{
    if (raw < BigInt(Number.MIN_SAFE_INTEGER) || raw > BigInt(Number.MAX_SAFE_INTEGER))
    {
        throw new Error(`scalarArgOf: ${raw} is outside the JS safe integer range — ` + `@node-3d/opencl's setKernelArg only accepts a plain number for a 64-bit ` + `scalar kernel argument, not a bigint, so a value this large cannot be passed ` + `as a scalar Int64/UInt64 argument today (an Int64Array/UInt64Array buffer ` + `argument has no such limit).`);
    }
    return Number(raw);
}

export function scalarArgOf(value: ScalarArgument):
    {
        cType: string;
        raw: number | boolean;
    }
{
    if (value instanceof Int8) return { cType: 'char', raw: value.valueOf() };
    if (value instanceof UInt8) return { cType: 'uchar', raw: value.valueOf() };
    if (value instanceof Int16) return { cType: 'short', raw: value.valueOf() };
    if (value instanceof UInt16) return { cType: 'ushort', raw: value.valueOf() };
    if (value instanceof Int32) return { cType: 'int', raw: value.valueOf() };
    if (value instanceof UInt32) return { cType: 'uint', raw: value.valueOf() };
    if (value instanceof Int64)
    {
        return { cType: 'long', raw: toSafeNumber(value.valueOf()) };
    }
    if (value instanceof UInt64)
    {
        return { cType: 'ulong', raw: toSafeNumber(value.valueOf()) };
    }
    if (value instanceof Float32) return { cType: 'float', raw: value.valueOf() };
    if (value instanceof Float64) return { cType: 'double', raw: value.valueOf() };
    if (value instanceof Bool) return { cType: 'bool', raw: value.valueOf() };
    throw new Error('scalarArgOf: not a J2OCL scalar instance');
}
