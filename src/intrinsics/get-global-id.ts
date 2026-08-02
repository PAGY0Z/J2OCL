/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../types/scalar/uint32.js';

/**
 * OpenCL's `get_global_id()` — the index of the current work-item along `dimension`.
 *
 * In plain terms: this declaration exists purely so the compiler can recognize and
 * type-check calls to it inside a kernel body (resolved by symbol, the same way
 * `detectKernels` resolves `Kernel`/`kernel` — never by name). The build path strips the
 * whole kernel body and replaces this call with real OpenCL C's `get_global_id()`.
 * Dev-mode simulation (which would need this to actually return a value) is out of scope
 * for now, so the body throws rather than embed a fake fallback.
 *
 * `dimension` is a plain JS literal (`0 | 1 | 2`), not a J2OCL type: it selects which axis
 * to query at compile time rather than flowing through kernel arithmetic as data.
 *
 * @param dimension - Which work-item dimension to query.
 * @returns Never returns — always throws.
 * @throws {Error} Always — see the description above.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- dimension is part of the public signature the compiler type-checks calls against; the body never reads it.
export function getGlobalId(dimension: 0 | 1 | 2): UInt32 {
  throw new Error('getGlobalId: only valid inside a compiled kernel body');
}
