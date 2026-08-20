/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../types/scalar/uint32.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getGlobalId(dimension: 0 | 1 | 2): UInt32 {
  throw new Error('getGlobalId: only valid inside a compiled kernel body');
}
