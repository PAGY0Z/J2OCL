/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { FloatArray } from '../../src/types/array/float-array.js';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider } from './fake-provider.js';

describe('Context#createBuffer / DeviceBuffer', () => {
  it('sizes and types the buffer from the source array', () => {
    const { provider } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();

    const array = FloatArray.from([1, 2, 3, 4]);
    const buffer = context.createBuffer(array, 'readWrite');

    expect(buffer.byteLength).toBe(16);
    expect(buffer.elementCType).toBe('float');
    expect(buffer.argCType).toBe('float*');
  });

  it('dispose() releases the buffer, and is a no-op the second time', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const buffer = context.createBuffer(FloatArray.from([1]), 'readOnly');

    buffer.dispose();
    buffer.dispose();

    expect(calls.filter((c) => c.method === 'releaseBuffer')).toHaveLength(1);
  });
});
