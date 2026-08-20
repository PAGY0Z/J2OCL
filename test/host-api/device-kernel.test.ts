/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { UInt32 } from '../../src/types/scalar/uint32.js';
import { FloatArray } from '../../src/types/array/float-array.js';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider } from './fake-provider.js';

describe('DeviceKernel#setArg', () => {
  it('resolves a scalar argument to its C type and raw value', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const program = context.buildProgram('__kernel void k(uint n) {}');
    const kernel = program.createKernel('k');

    kernel.setArg(0, UInt32.of(4));

    const call = calls.find((c) => c.method === 'setKernelArg');
    expect(call?.args.slice(1)).toEqual([0, 'uint', 4]);
  });

  it('resolves a DeviceBuffer argument to its handle and pointer C type', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const program = context.buildProgram('__kernel void k(__global float* a) {}');
    const kernel = program.createKernel('k');
    const buffer = context.createBuffer(FloatArray.from([1]), 'readWrite');

    kernel.setArg(0, buffer);

    const call = calls.find((c) => c.method === 'setKernelArg');
    expect(call?.args[2]).toBe('float*');
    expect(call?.args[3]).toBe(buffer.handle);
  });

  it('dispose() releases the kernel, and is a no-op the second time', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const program = context.buildProgram('__kernel void k() {}');
    const kernel = program.createKernel('k');

    kernel.dispose();
    kernel.dispose();

    expect(calls.filter((c) => c.method === 'releaseKernel')).toHaveLength(1);
  });
});
