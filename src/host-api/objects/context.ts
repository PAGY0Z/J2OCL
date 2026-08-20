/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { BufferAccess, OpenCLProvider } from '../../runtime/provider.js';
import type { Device } from './device.js';
import { elementCTypeOf, type AnyJ2OCLArray } from '../arguments/array-element-type.js';
import { getRawBuffer } from '../../types/array/raw-access.js';
import { CommandQueue } from './command-queue.js';
import { DeviceBuffer } from './device-buffer.js';
import { Program } from './program.js';

export class Context {
  #disposed = false;

  private constructor(
    private readonly provider: OpenCLProvider,
    readonly handle: unknown,
    private readonly device: Device,
  ) {}

  static create(provider: OpenCLProvider, device: Device): Context {
    return new Context(provider, provider.createContext(device.handle), device);
  }

  get deviceHandle(): unknown {
    return this.device.handle;
  }

  createCommandQueue(): CommandQueue {
    return CommandQueue.create(this.provider, this);
  }

  buildProgram(source: string): Program {
    return Program.build(this.provider, this, source);
  }

  createBuffer(array: AnyJ2OCLArray, access: BufferAccess): DeviceBuffer {
    const raw = getRawBuffer(array);
    return DeviceBuffer.create(this.provider, this, raw.byteLength, elementCTypeOf(array), access);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.provider.releaseContext(this.handle);
    this.#disposed = true;
  }
}
