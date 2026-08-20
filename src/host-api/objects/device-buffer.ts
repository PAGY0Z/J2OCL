/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { BufferAccess, OpenCLProvider } from '../../runtime/provider.js';
import type { Context } from './context.js';

export class DeviceBuffer {
  #disposed = false;

  private constructor(
    private readonly provider: OpenCLProvider,
    readonly handle: unknown,
    readonly byteLength: number,
    readonly elementCType: string,
  ) {}

  static create(provider: OpenCLProvider, context: Context, byteLength: number, elementCType: string, access: BufferAccess): DeviceBuffer {
    const handle = provider.createBuffer(context.handle, byteLength, access);
    return new DeviceBuffer(provider, handle, byteLength, elementCType);
  }

  get argCType(): string {
    return `${this.elementCType}*`;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.provider.releaseBuffer(this.handle);
    this.#disposed = true;
  }
}
