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

describe('CommandQueue', () => {
  it('writeBuffer copies the source array bytes into the device buffer', () => {
    const { provider } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const queue = context.createCommandQueue();
    const source = FloatArray.from([1, 2, 3]);
    const buffer = context.createBuffer(source, 'readOnly');

    queue.writeBuffer(buffer, source);

    const destination = FloatArray.from([0, 0, 0]);
    queue.readBuffer(buffer, destination);
    expect(destination.get(UInt32.of(0)).valueOf()).toBe(1);
    expect(destination.get(UInt32.of(1)).valueOf()).toBe(2);
    expect(destination.get(UInt32.of(2)).valueOf()).toBe(3);
  });

  it('enqueueKernel and finish call the provider with the right arguments', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const queue = context.createCommandQueue();

    queue.enqueueKernel({ handle: 'fake-kernel' } as never, [10]);
    queue.finish();

    const enqueueCall = calls.find((c) => c.method === 'enqueueKernel');
    expect(enqueueCall?.args[2]).toEqual([10]);
    expect(calls.some((c) => c.method === 'finish')).toBe(true);
  });

  it('dispose() releases the queue, and is a no-op the second time', () => {
    const { provider, calls } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    const context = device.createContext();
    const queue = context.createCommandQueue();

    queue.dispose();
    queue.dispose();

    expect(calls.filter((c) => c.method === 'releaseCommandQueue')).toHaveLength(1);
  });
});
