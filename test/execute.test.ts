/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { FloatArray } from '../src/types/array/float-array.js';
import { createFakeProvider } from './host-api/fake-provider.js';

describe('src/execute.ts (the /execute package entry point)', () => {
  it('exports a working runKernel and NodeOpenCLProvider', async () => {
    const { runKernel, NodeOpenCLProvider } = await import('../src/execute.js');

    expect(typeof NodeOpenCLProvider).toBe('function');

    const { provider, calls } = createFakeProvider();
    const input = FloatArray.from([21]);
    const out = FloatArray.from([0]);

    runKernel({
      provider,
      source: '__kernel void doubleIt(__global float* input, __global float* out) {\n' + '  uint i = get_global_id(0);\n' + '  out[i] = input[i] * 2.0f;\n' + '}',
      name: 'doubleIt',
      args: [
        { value: input, access: 'readOnly' },
        { value: out, access: 'writeOnly' },
      ],
    });

    expect(calls.filter((c) => c.method === 'enqueueKernel')).toHaveLength(1);
  });
});

describe('src/index.ts (the root package entry point)', () => {
  it('does not export runKernel or NodeOpenCLProvider — those live at the /execute entry point instead', async () => {
    const rootIndex = (await import('../src/index.js')) as unknown as Record<string, unknown>;

    expect(rootIndex.runKernel).toBeUndefined();
    expect(rootIndex.NodeOpenCLProvider).toBeUndefined();
  });
});
