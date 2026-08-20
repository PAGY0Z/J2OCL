/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { OpenCLProvider } from '../../runtime/provider.js';
import type { Context } from './context.js';
import { DeviceKernel } from './device-kernel.js';

export class Program
{
    #disposed = false;

    private constructor (
        private readonly provider: OpenCLProvider,
        readonly handle: unknown,
    ) { }

    static build(provider: OpenCLProvider, context: Context, source: string): Program
    {
        const handle = provider.createProgram(context.handle, source);
        try
        {
            provider.buildProgram(handle, context.deviceHandle);
        } catch (error)
        {
            try
            {
                const buildLog = provider.getProgramBuildLog(handle, context.deviceHandle);
                throw new Error(`Program.build: build failed:\n${buildLog}`, {
                    cause: error,
                });
            } finally
            {
                provider.releaseProgram(handle);
            }
        }
        return new Program(provider, handle);
    }

    createKernel(name: string): DeviceKernel
    {
        return DeviceKernel.create(this.provider, this, name);
    }

    dispose(): void
    {
        if (this.#disposed) return;
        this.provider.releaseProgram(this.handle);
        this.#disposed = true;
    }
}
