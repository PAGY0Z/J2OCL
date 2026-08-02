/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { getGlobalId } from '../../src/intrinsics/get-global-id.js';

describe('getGlobalId', () => {
  it('throws when called directly — it only has meaning inside a compiled kernel body', () => {
    expect(() => getGlobalId(0)).toThrow(
      /only valid inside a compiled kernel body/,
    );
  });
});
