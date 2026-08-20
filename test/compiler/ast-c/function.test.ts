/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CBlock } from '../../../src/compiler/ast-c/statements.js';
import { CFunction } from '../../../src/compiler/ast-c/function.js';

describe('CFunction', () => {
  it('stores name/parameters/body', () => {
    const body = new CBlock([]);
    const node = new CFunction('vectorAdd', [{ cType: '__global float*', name: 'a' }], body);
    expect(node.name).toBe('vectorAdd');
    expect(node.parameters).toEqual([{ cType: '__global float*', name: 'a' }]);
    expect(node.body).toBe(body);
  });
});
