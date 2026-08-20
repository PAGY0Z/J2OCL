/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

export type DeviceKind = 'cpu' | 'gpu' | 'accelerator' | 'default';

export type BufferAccess = 'readOnly' | 'writeOnly' | 'readWrite';

export interface OpenCLProvider {
  listPlatforms(): unknown[];
  getPlatformName(platform: unknown): string;
  listDevices(platform: unknown): unknown[];
  getDeviceName(device: unknown): string;
  getDeviceKind(device: unknown): DeviceKind;

  createContext(device: unknown): unknown;
  releaseContext(context: unknown): void;

  createCommandQueue(context: unknown, device: unknown): unknown;
  releaseCommandQueue(queue: unknown): void;

  createBuffer(context: unknown, byteLength: number, access: BufferAccess): unknown;
  releaseBuffer(buffer: unknown): void;
  writeBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void;
  readBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void;

  createProgram(context: unknown, source: string): unknown;
  buildProgram(program: unknown, device: unknown): void;
  getProgramBuildLog(program: unknown, device: unknown): string;
  releaseProgram(program: unknown): void;

  createKernel(program: unknown, name: string): unknown;
  releaseKernel(kernel: unknown): void;
  setKernelArg(kernel: unknown, index: number, cType: string, value: unknown): void;

  enqueueKernel(queue: unknown, kernel: unknown, globalWorkSize: number[]): void;
  finish(queue: unknown): void;
}
