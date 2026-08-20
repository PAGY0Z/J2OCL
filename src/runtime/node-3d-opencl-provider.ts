/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { createRequire } from 'node:module';
import type { TClContext, TClDevice, TClKernel, TClMem, TClPlatform, TClProgram, TClQueue } from '@node-3d/opencl';
import type { BufferAccess, DeviceKind, OpenCLProvider } from './provider.js';

type ClModule = typeof import('@node-3d/opencl');

const nodeRequire = createRequire(import.meta.url);

let cached: { cl: ClModule; bufferAccessFlags: Record<BufferAccess, number> } | undefined;

function loadCl(): {
  cl: ClModule;
  bufferAccessFlags: Record<BufferAccess, number>;
} {
  if (!cached) {
    const cl = nodeRequire('@node-3d/opencl') as ClModule;
    cached = {
      cl,
      bufferAccessFlags: {
        readOnly: cl.MEM_READ_ONLY,
        writeOnly: cl.MEM_WRITE_ONLY,
        readWrite: cl.MEM_READ_WRITE,
      },
    };
  }
  return cached;
}

export class NodeOpenCLProvider implements OpenCLProvider {
  listPlatforms(): unknown[] {
    return loadCl().cl.getPlatformIDs();
  }

  getPlatformName(platform: unknown): string {
    const { cl } = loadCl();
    return cl.getPlatformInfo(platform as TClPlatform, cl.PLATFORM_NAME);
  }

  listDevices(platform: unknown): unknown[] {
    const { cl } = loadCl();
    return cl.getDeviceIDs(platform as TClPlatform, cl.DEVICE_TYPE_ALL);
  }

  getDeviceName(device: unknown): string {
    const { cl } = loadCl();
    return cl.getDeviceInfo(device as TClDevice, cl.DEVICE_NAME) as string;
  }

  getDeviceKind(device: unknown): DeviceKind {
    const { cl } = loadCl();
    const type = cl.getDeviceInfo(device as TClDevice, cl.DEVICE_TYPE) as number;
    if (type & cl.DEVICE_TYPE_GPU) return 'gpu';
    if (type & cl.DEVICE_TYPE_CPU) return 'cpu';
    if (type & cl.DEVICE_TYPE_ACCELERATOR) return 'accelerator';
    return 'default';
  }

  createContext(device: unknown): unknown {
    return loadCl().cl.createContext(null, [device as TClDevice]);
  }

  releaseContext(context: unknown): void {
    loadCl().cl.releaseContext(context as TClContext);
  }

  createCommandQueue(context: unknown, device: unknown): unknown {
    return loadCl().cl.createCommandQueue(context as TClContext, device as TClDevice);
  }

  releaseCommandQueue(queue: unknown): void {
    loadCl().cl.releaseCommandQueue(queue as TClQueue);
  }

  createBuffer(context: unknown, byteLength: number, access: BufferAccess): unknown {
    const { cl, bufferAccessFlags } = loadCl();
    return cl.createBuffer(context as TClContext, bufferAccessFlags[access], byteLength);
  }

  releaseBuffer(buffer: unknown): void {
    loadCl().cl.releaseMemObject(buffer as TClMem);
  }

  writeBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void {
    loadCl().cl.enqueueWriteBuffer(queue as TClQueue, buffer as TClMem, true, 0, hostData.byteLength, hostData);
  }

  readBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void {
    loadCl().cl.enqueueReadBuffer(queue as TClQueue, buffer as TClMem, true, 0, hostData.byteLength, hostData);
  }

  createProgram(context: unknown, source: string): unknown {
    return loadCl().cl.createProgramWithSource(context as TClContext, source);
  }

  buildProgram(program: unknown, device: unknown): void {
    loadCl().cl.buildProgram(program as TClProgram, [device as TClDevice]);
  }

  getProgramBuildLog(program: unknown, device: unknown): string {
    const { cl } = loadCl();
    return cl.getProgramBuildInfo(program as TClProgram, device as TClDevice, cl.PROGRAM_BUILD_LOG) as string;
  }

  releaseProgram(program: unknown): void {
    loadCl().cl.releaseProgram(program as TClProgram);
  }

  createKernel(program: unknown, name: string): unknown {
    return loadCl().cl.createKernel(program as TClProgram, name);
  }

  releaseKernel(kernel: unknown): void {
    loadCl().cl.releaseKernel(kernel as TClKernel);
  }

  setKernelArg(kernel: unknown, index: number, cType: string, value: unknown): void {
    loadCl().cl.setKernelArg(kernel as TClKernel, index, cType, value);
  }

  enqueueKernel(queue: unknown, kernel: unknown, globalWorkSize: number[]): void {
    loadCl().cl.enqueueNDRangeKernel(queue as TClQueue, kernel as TClKernel, globalWorkSize.length, null, globalWorkSize);
  }

  finish(queue: unknown): void {
    loadCl().cl.finish(queue as TClQueue);
  }
}
