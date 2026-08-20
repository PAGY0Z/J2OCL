/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { BufferAccess, OpenCLProvider } from './runtime/provider.js';
import { NodeOpenCLProvider } from './runtime/node-3d-opencl-provider.js';
import { Platform } from './host-api/objects/platform.js';
import type { Device } from './host-api/objects/device.js';
import type { DeviceBuffer } from './host-api/objects/device-buffer.js';
import { isAnyJ2OCLArray, type AnyJ2OCLArray } from './host-api/arguments/array-element-type.js';
import type { ScalarArgument } from './host-api/arguments/scalar-argument.js';
import { getRawBuffer } from './types/array/raw-access.js';

export interface KernelArgSpec {
  value: ScalarArgument | AnyJ2OCLArray;
  access?: BufferAccess;
}

export interface RunKernelOptions {
  provider?: OpenCLProvider;
  device?: Device;
  source: string;
  name: string;
  args: KernelArgSpec[];
  globalWorkSize?: number[];
}

function pickDefaultDevice(provider: OpenCLProvider): Device {
  for (const platform of Platform.list(provider)) {
    const devices = platform.devices();
    const gpu = devices.find((candidate) => candidate.kind === 'gpu');
    if (gpu) return gpu;
    if (devices.length > 0) return devices[0];
  }
  throw new Error('runKernel: no OpenCL device found on this machine');
}

function inferGlobalWorkSize(args: KernelArgSpec[]): number[] {
  const lengths = args
    .map((arg) => arg.value)
    .filter(isAnyJ2OCLArray)
    .map((array) => getRawBuffer(array).length);

  if (lengths.length === 0) {
    throw new Error('runKernel: globalWorkSize was not given and cannot be inferred — there is no ' + 'array argument to infer it from; pass globalWorkSize explicitly.');
  }
  const [first, ...rest] = lengths;
  if (rest.some((length) => length !== first)) {
    throw new Error(`runKernel: globalWorkSize was not given and cannot be inferred — array ` + `arguments have different lengths (${lengths.join(', ')}); pass globalWorkSize ` + `explicitly.`);
  }
  return [first];
}

export function runKernel(options: RunKernelOptions): void {
  const provider = options.provider ?? new NodeOpenCLProvider();
  const device = options.device ?? pickDefaultDevice(provider);
  const globalWorkSize = options.globalWorkSize ?? inferGlobalWorkSize(options.args);

  const context = device.createContext();
  const queue = context.createCommandQueue();
  const buffers: {
    buffer: DeviceBuffer;
    value: AnyJ2OCLArray;
    access: BufferAccess;
  }[] = [];

  try {
    const program = context.buildProgram(options.source);
    try {
      const kernel = program.createKernel(options.name);
      try {
        options.args.forEach((arg, index) => {
          if (isAnyJ2OCLArray(arg.value)) {
            const access = arg.access ?? 'readWrite';
            const buffer = context.createBuffer(arg.value, access);
            buffers.push({ buffer, value: arg.value, access });
            if (access !== 'writeOnly') {
              queue.writeBuffer(buffer, arg.value);
            }
            kernel.setArg(index, buffer);
          } else {
            kernel.setArg(index, arg.value);
          }
        });

        queue.enqueueKernel(kernel, globalWorkSize);

        for (const { buffer, value, access } of buffers) {
          if (access !== 'readOnly') {
            queue.readBuffer(buffer, value);
          }
        }
        queue.finish();
      } finally {
        for (const { buffer } of buffers) buffer.dispose();
        kernel.dispose();
      }
    } finally {
      program.dispose();
    }
  } finally {
    queue.dispose();
    context.dispose();
  }
}
