/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider } from './fake-provider.js';

describe('Platform.list', () => {
  it('lists platforms with their name', () => {
    const { provider } = createFakeProvider();
    const platforms = Platform.list(provider);
    expect(platforms).toHaveLength(1);
    expect(platforms[0].name).toBe('Fake Platform');
  });
});

describe('Platform#devices', () => {
  it('lists the devices belonging to this platform', () => {
    const { provider } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const devices = platform.devices();
    expect(devices).toHaveLength(1);
    expect(devices[0].name).toBe('Fake Device');
  });
});
