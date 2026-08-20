/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider } from './fake-provider.js';

describe('Context', () => {
  it('is created through Device.createContext, calling the provider once', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    device.createContext();
    expect(calls.some((c) => c.method === 'createContext')).toBe(true);
  });

  it('dispose() releases the context, and is a no-op the second time', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    context.dispose();
    context.dispose();

    const releaseCalls = calls.filter((c) => c.method === 'releaseContext');
    expect(releaseCalls).toHaveLength(1);
  });
});
