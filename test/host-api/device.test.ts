/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Platform } from '../../src/host-api/objects/platform.js';
import { createFakeProvider } from './fake-provider.js';

describe('Device', () => {
  it('exposes its name and kind', () => {
    const { provider } = createFakeProvider();
    const [platform] = Platform.list(provider);
    const [device] = platform.devices();
    expect(device.name).toBe('Fake Device');
    expect(device.kind).toBe('gpu');
  });
});
