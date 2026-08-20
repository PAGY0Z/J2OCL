/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { DeviceKind, OpenCLProvider } from '../../runtime/provider.js';
import { Context } from './context.js';

export class Device {
  private constructor(
    private readonly provider: OpenCLProvider,
    readonly handle: unknown,
    readonly name: string,
    readonly kind: DeviceKind,
  ) {}

  static list(provider: OpenCLProvider, platformHandle: unknown): Device[] {
    return provider.listDevices(platformHandle).map((handle) => new Device(provider, handle, provider.getDeviceName(handle), provider.getDeviceKind(handle)));
  }

  createContext(): Context {
    return Context.create(this.provider, this);
  }
}
