/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { BufferAccess, DeviceKind, OpenCLProvider } from '../../src/runtime/provider.js';

interface FakeCall {
  method: string;
  args: unknown[];
}

interface FakeBuffer {
  kind: 'buffer';
  storage: ArrayBuffer;
}

export function createFakeProvider(): {
  provider: OpenCLProvider;
  calls: FakeCall[];
} {
  const calls: FakeCall[] = [];
  let nextId = 0;
  const record = (method: string, ...args: unknown[]): { id: number } => {
    calls.push({ method, args });
    return { id: nextId++ };
  };

  const platform = { id: 'platform-0' };
  const device = { id: 'device-0' };

  const provider: OpenCLProvider = {
    listPlatforms: () => {
      calls.push({ method: 'listPlatforms', args: [] });
      return [platform];
    },
    getPlatformName: (p) => {
      calls.push({ method: 'getPlatformName', args: [p] });
      return 'Fake Platform';
    },
    listDevices: (p) => {
      calls.push({ method: 'listDevices', args: [p] });
      return p === platform ? [device] : [];
    },
    getDeviceName: (d) => {
      calls.push({ method: 'getDeviceName', args: [d] });
      return 'Fake Device';
    },
    getDeviceKind: (d): DeviceKind => {
      calls.push({ method: 'getDeviceKind', args: [d] });
      return 'gpu';
    },
    createContext: (d) => record('createContext', d),
    releaseContext: (c) => {
      calls.push({ method: 'releaseContext', args: [c] });
    },
    createCommandQueue: (c, d) => record('createCommandQueue', c, d),
    releaseCommandQueue: (q) => {
      calls.push({ method: 'releaseCommandQueue', args: [q] });
    },
    createBuffer: (c, byteLength, access: BufferAccess): FakeBuffer => {
      calls.push({ method: 'createBuffer', args: [c, byteLength, access] });
      return { kind: 'buffer', storage: new ArrayBuffer(byteLength) };
    },
    releaseBuffer: (b) => {
      calls.push({ method: 'releaseBuffer', args: [b] });
    },
    writeBuffer: (q, b, hostData) => {
      calls.push({ method: 'writeBuffer', args: [q, b, hostData] });
      new Uint8Array((b as FakeBuffer).storage).set(new Uint8Array(hostData.buffer, hostData.byteOffset, hostData.byteLength));
    },
    readBuffer: (q, b, hostData) => {
      calls.push({ method: 'readBuffer', args: [q, b, hostData] });
      new Uint8Array(hostData.buffer, hostData.byteOffset, hostData.byteLength).set(new Uint8Array((b as FakeBuffer).storage));
    },
    createProgram: (c, source) => record('createProgram', c, source),
    buildProgram: (p, d) => {
      calls.push({ method: 'buildProgram', args: [p, d] });
    },
    getProgramBuildLog: (p, d) => {
      calls.push({ method: 'getProgramBuildLog', args: [p, d] });
      return 'fake build log';
    },
    releaseProgram: (p) => {
      calls.push({ method: 'releaseProgram', args: [p] });
    },
    createKernel: (p, name) => record('createKernel', p, name),
    releaseKernel: (k) => {
      calls.push({ method: 'releaseKernel', args: [k] });
    },
    setKernelArg: (k, index, cType, value) => {
      calls.push({ method: 'setKernelArg', args: [k, index, cType, value] });
    },
    enqueueKernel: (q, k, globalWorkSize) => {
      calls.push({ method: 'enqueueKernel', args: [q, k, globalWorkSize] });
    },
    finish: (q) => {
      calls.push({ method: 'finish', args: [q] });
    },
  };

  return { provider, calls };
}

export function createFakeProviderWithFailingBuild(): {
  provider: OpenCLProvider;
  calls: FakeCall[];
} {
  const fake = createFakeProvider();
  fake.provider.buildProgram = () => {
    throw new Error('fake CL build error');
  };
  return fake;
}

export function createFakeProviderWithFailingBuildAndLog(): {
  provider: OpenCLProvider;
  calls: FakeCall[];
} {
  const fake = createFakeProviderWithFailingBuild();
  fake.provider.getProgramBuildLog = () => {
    throw new Error('fake build log fetch error');
  };
  return fake;
}
