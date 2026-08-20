/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { CVisitor } from './visitor.js';

export abstract class CNode {
  abstract accept<T>(visitor: CVisitor<T>): T;
}
