/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { UInt32 } from '../src/types/scalar/uint32.js';
import { FloatArray } from '../src/types/array/float-array.js';
import { Platform } from '../src/host-api/objects/platform.js';
import { runKernel } from '../src/run-kernel.js';
import { createFakeProvider } from './host-api/fake-provider.js';

const VECTOR_ADD_CL = '__kernel void vectorAdd(__global float* a, __global float* b, __global float* out) {\n' + '  uint i = get_global_id(0);\n' + '  out[i] = (a[i] + b[i]);\n' + '}';

describe('runKernel', () => {
  it('creates buffers, writes inputs, launches, and reads back the output', () => {
    const { provider, calls } = createFakeProvider();
    const a = FloatArray.from([1, 2, 3]);
    const b = FloatArray.from([10, 20, 30]);
    const out = FloatArray.from([0, 0, 0]);

    runKernel({
      provider,
      source: VECTOR_ADD_CL,
      name: 'vectorAdd',
      args: [
        { value: a, access: 'readOnly' },
        { value: b, access: 'readOnly' },
        { value: out, access: 'writeOnly' },
      ],
    });

    expect(calls.filter((c) => c.method === 'createBuffer')).toHaveLength(3);
    expect(calls.filter((c) => c.method === 'writeBuffer')).toHaveLength(2);
    const enqueueCall = calls.find((c) => c.method === 'enqueueKernel');
    expect(enqueueCall?.args[2]).toEqual([3]);
    expect(calls.filter((c) => c.method === 'readBuffer')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'releaseBuffer')).toHaveLength(3);
    expect(calls.filter((c) => c.method === 'releaseKernel')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'releaseProgram')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'releaseCommandQueue')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'releaseContext')).toHaveLength(1);
  });

  it('sets scalar arguments directly, without creating a buffer', () => {
    const { provider, calls } = createFakeProvider();

    runKernel({
      provider,
      source: '__kernel void k(uint n) {}',
      name: 'k',
      args: [{ value: UInt32.of(4) }],
      globalWorkSize: [1],
    });

    expect(calls.filter((c) => c.method === 'createBuffer')).toHaveLength(0);
    const setArgCall = calls.find((c) => c.method === 'setKernelArg');
    expect(setArgCall?.args.slice(1)).toEqual([0, 'uint', 4]);
  });

  it('defaults array access to readWrite, writing before and reading back after', () => {
    const { provider, calls } = createFakeProvider();
    const buf = FloatArray.from([1, 2]);

    runKernel({
      provider,
      source: '__kernel void k(__global float* buf) {}',
      name: 'k',
      args: [{ value: buf }],
    });

    expect(calls.filter((c) => c.method === 'writeBuffer')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'readBuffer')).toHaveLength(1);
  });

  it('throws when globalWorkSize is omitted and there are no array arguments', () => {
    const { provider } = createFakeProvider();

    expect(() =>
      runKernel({
        provider,
        source: '__kernel void k(uint n) {}',
        name: 'k',
        args: [{ value: UInt32.of(1) }],
      }),
    ).toThrow(/cannot be inferred/);
  });

  it('throws when globalWorkSize is omitted and array arguments disagree on length', () => {
    const { provider } = createFakeProvider();

    expect(() =>
      runKernel({
        provider,
        source: '__kernel void k(__global float* a, __global float* b) {}',
        name: 'k',
        args: [{ value: FloatArray.from([1, 2, 3]) }, { value: FloatArray.from([1, 2]) }],
      }),
    ).toThrow(/different lengths/);
  });

  it('defaults to a real NodeOpenCLProvider when none is given', () => {
    const { provider: fakeProvider, calls } = createFakeProvider();
    const [platform] = Platform.list(fakeProvider);
    const [device] = platform.devices();

    runKernel({
      device,
      source: '__kernel void k(uint n) {}',
      name: 'k',
      args: [{ value: UInt32.of(1) }],
      globalWorkSize: [1],
    });

    expect(calls.some((c) => c.method === 'createContext')).toBe(true);
  });

  it('falls back to the first device when none report the gpu kind', () => {
    const { provider, calls } = createFakeProvider();
    provider.getDeviceKind = () => 'cpu';

    runKernel({
      provider,
      source: '__kernel void k(uint n) {}',
      name: 'k',
      args: [{ value: UInt32.of(1) }],
      globalWorkSize: [1],
    });

    expect(calls.some((c) => c.method === 'createContext')).toBe(true);
  });

  it('throws when no device is available on the machine at all', () => {
    const { provider } = createFakeProvider();
    provider.listDevices = () => [];

    expect(() =>
      runKernel({
        provider,
        source: '__kernel void k(uint n) {}',
        name: 'k',
        args: [{ value: UInt32.of(1) }],
        globalWorkSize: [1],
      }),
    ).toThrow('runKernel: no OpenCL device found on this machine');
  });

  it('releases every resource even when the kernel fails to build', () => {
    const { provider, calls } = createFakeProvider();
    provider.buildProgram = () => {
      throw new Error('fake CL build error');
    };

    expect(() =>
      runKernel({
        provider,
        source: 'not valid C',
        name: 'k',
        args: [{ value: UInt32.of(1) }],
        globalWorkSize: [1],
      }),
    ).toThrow();
    expect(calls.filter((c) => c.method === 'releaseContext')).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'releaseCommandQueue')).toHaveLength(1);
  });
});
