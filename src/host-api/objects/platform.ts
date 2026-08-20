/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { OpenCLProvider } from '../../runtime/provider.js';
import { Device } from './device.js';

export class Platform
{
    private constructor (
        private readonly provider: OpenCLProvider,
        readonly handle: unknown,
        readonly name: string,
    ) { }

    static list(provider: OpenCLProvider): Platform[]
    {
        return provider.listPlatforms().map((handle) => new Platform(provider, handle, provider.getPlatformName(handle)));
    }

    devices(): Device[]
    {
        return Device.list(this.provider, this.handle);
    }
}
