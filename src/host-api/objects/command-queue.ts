/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { OpenCLProvider } from '../../runtime/provider.js';
import type { Context } from './context.js';
import type { DeviceBuffer } from './device-buffer.js';
import { getRawBuffer } from '../../types/array/raw-access.js';
import type { AnyJ2OCLArray } from '../arguments/array-element-type.js';
import type { DeviceKernel } from './device-kernel.js';

export class CommandQueue
{
    #disposed = false;

    private constructor (
        private readonly provider: OpenCLProvider,
        readonly handle: unknown,
    ) { }

    static create(provider: OpenCLProvider, context: Context): CommandQueue
    {
        return new CommandQueue(provider, provider.createCommandQueue(context.handle, context.deviceHandle));
    }

    writeBuffer(buffer: DeviceBuffer, source: AnyJ2OCLArray): void
    {
        this.provider.writeBuffer(this.handle, buffer.handle, getRawBuffer(source));
    }

    readBuffer(buffer: DeviceBuffer, destination: AnyJ2OCLArray): void
    {
        this.provider.readBuffer(this.handle, buffer.handle, getRawBuffer(destination));
    }

    enqueueKernel(kernel: DeviceKernel, globalWorkSize: number[]): void
    {
        this.provider.enqueueKernel(this.handle, kernel.handle, globalWorkSize);
    }

    finish(): void
    {
        this.provider.finish(this.handle);
    }

    dispose(): void
    {
        if (this.#disposed) return;
        this.provider.releaseCommandQueue(this.handle);
        this.#disposed = true;
    }
}
