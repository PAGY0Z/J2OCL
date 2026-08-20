/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { CBlock } from './statements.js';

export interface CParameter {
  cType: string;
  name: string;
}

export class CFunction {
  constructor(
    readonly name: string,
    readonly parameters: CParameter[],
    readonly body: CBlock,
  ) {}
}
