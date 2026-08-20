/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider, createFakeProviderWithFailingBuild, createFakeProviderWithFailingBuildAndLog } from './fake-provider.js';

describe('Context#buildProgram / Program', () => {
  it('builds successfully and can fetch a kernel by name', () => {
    const { provider } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    const program = context.buildProgram('__kernel void noop() {}');
    const kernel = program.createKernel('noop');

    expect(kernel).toBeDefined();
  });

  it('throws with the build log when the build fails', () => {
    const { provider } = createFakeProviderWithFailingBuild();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    expect(() => context.buildProgram('not valid C')).toThrow('fake build log');
  });

  it('releases the program handle when the build fails, instead of leaking it', () => {
    const { provider, calls } = createFakeProviderWithFailingBuild();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    expect(() => context.buildProgram('not valid C')).toThrow();

    expect(calls.filter((c) => c.method === 'releaseProgram')).toHaveLength(1);
  });

  it('still releases the program handle if fetching the build log also throws', () => {
    const { provider, calls } = createFakeProviderWithFailingBuildAndLog();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    expect(() => context.buildProgram('not valid C')).toThrow('fake build log fetch error');

    expect(calls.filter((c) => c.method === 'releaseProgram')).toHaveLength(1);
  });

  it('dispose() releases the program, and is a no-op the second time', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const program = context.buildProgram('__kernel void noop() {}');

    program.dispose();
    program.dispose();

    expect(calls.filter((c) => c.method === 'releaseProgram')).toHaveLength(1);
  });
});
