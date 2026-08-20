/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { OpenCLProvider } from '../../runtime/provider.js';
import type { Program } from './program.js';
import { DeviceBuffer } from './device-buffer.js';
import { scalarArgOf, type ScalarArgument } from '../arguments/scalar-argument.js';

export type DeviceKernelArgument = ScalarArgument | DeviceBuffer;

export class DeviceKernel
{
    #disposed = false;

    private constructor (
        private readonly provider: OpenCLProvider,
        readonly handle: unknown,
    ) { }

    static create(provider: OpenCLProvider, program: Program, name: string): DeviceKernel
    {
        return new DeviceKernel(provider, provider.createKernel(program.handle, name));
    }

    setArg(index: number, value: DeviceKernelArgument): void
    {
        if (value instanceof DeviceBuffer)
        {
            this.provider.setKernelArg(this.handle, index, value.argCType, value.handle);
            return;
        }
        const { cType, raw } = scalarArgOf(value);
        this.provider.setKernelArg(this.handle, index, cType, raw);
    }

    dispose(): void
    {
        if (this.#disposed) return;
        this.provider.releaseKernel(this.handle);
        this.#disposed = true;
    }
}
