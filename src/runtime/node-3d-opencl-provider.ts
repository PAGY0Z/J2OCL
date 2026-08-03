/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import * as cl from '@node-3d/opencl';
import type {
  TClContext,
  TClDevice,
  TClKernel,
  TClMem,
  TClPlatform,
  TClProgram,
  TClQueue,
} from '@node-3d/opencl';
import type { BufferAccess, DeviceKind, OpenCLProvider } from './provider.js';

/** Maps our own `BufferAccess` to the raw numeric memory flag `cl.createBuffer` expects. */
const BUFFER_ACCESS_FLAGS: Record<BufferAccess, number> = {
  readOnly: cl.MEM_READ_ONLY,
  writeOnly: cl.MEM_WRITE_ONLY,
  readWrite: cl.MEM_READ_WRITE,
};

/**
 * The only file in this project allowed to import `@node-3d/opencl`. Every method here
 * is a thin, direct forward to the real OpenCL 1.2 binding — see `OpenCLProvider` in
 * `provider.ts` for what each operation means and why handles are `unknown`.
 */
export class NodeOpenCLProvider implements OpenCLProvider {
  /** Every OpenCL platform (vendor driver) installed on this machine, via `cl.getPlatformIDs`. */
  listPlatforms(): unknown[] {
    return cl.getPlatformIDs();
  }

  /** A platform's human-readable name, via `cl.getPlatformInfo`'s `PLATFORM_NAME` field. */
  getPlatformName(platform: unknown): string {
    return cl.getPlatformInfo(platform as TClPlatform, cl.PLATFORM_NAME);
  }

  /** Every device `platform` exposes, of any kind, via `cl.getDeviceIDs(platform, DEVICE_TYPE_ALL)`. */
  listDevices(platform: unknown): unknown[] {
    return cl.getDeviceIDs(platform as TClPlatform, cl.DEVICE_TYPE_ALL);
  }

  /** A device's human-readable name, via `cl.getDeviceInfo`'s `DEVICE_NAME` field. */
  getDeviceName(device: unknown): string {
    return cl.getDeviceInfo(device as TClDevice, cl.DEVICE_NAME) as string;
  }

  /**
   * Reads `device`'s OpenCL device-type via `cl.getDeviceInfo`'s `DEVICE_TYPE` field —
   * one of OpenCL's own numeric device-type constants — and maps it to a `DeviceKind`.
   */
  getDeviceKind(device: unknown): DeviceKind {
    const type = cl.getDeviceInfo(
      device as TClDevice,
      cl.DEVICE_TYPE,
    ) as number;
    if (type === cl.DEVICE_TYPE_GPU) return 'gpu';
    if (type === cl.DEVICE_TYPE_CPU) return 'cpu';
    if (type === cl.DEVICE_TYPE_ACCELERATOR) return 'accelerator';
    return 'default';
  }

  /** Creates a context bound only to `device` (no shared properties), via `cl.createContext`. */
  createContext(device: unknown): unknown {
    return cl.createContext(null, [device as TClDevice]);
  }

  /** Releases a context, via `cl.releaseContext`. */
  releaseContext(context: unknown): void {
    cl.releaseContext(context as TClContext);
  }

  /** Creates a command queue on `context`/`device` with OpenCL's default (in-order) properties, via `cl.createCommandQueue`. */
  createCommandQueue(context: unknown, device: unknown): unknown {
    return cl.createCommandQueue(context as TClContext, device as TClDevice);
  }

  /** Releases a command queue, via `cl.releaseCommandQueue`. */
  releaseCommandQueue(queue: unknown): void {
    cl.releaseCommandQueue(queue as TClQueue);
  }

  /**
   * Allocates a `byteLength`-byte device buffer, via `cl.createBuffer` — `access` is
   * translated to the matching raw OpenCL memory flag via `BUFFER_ACCESS_FLAGS`.
   */
  createBuffer(
    context: unknown,
    byteLength: number,
    access: BufferAccess,
  ): unknown {
    return cl.createBuffer(
      context as TClContext,
      BUFFER_ACCESS_FLAGS[access],
      byteLength,
    );
  }

  /** Releases a buffer, via `cl.releaseMemObject` (OpenCL's generic name for any memory object). */
  releaseBuffer(buffer: unknown): void {
    cl.releaseMemObject(buffer as TClMem);
  }

  /**
   * Uploads `hostData` into `buffer`, via `cl.enqueueWriteBuffer` with `blockingWrite:
   * true` so the call only returns once the transfer has actually finished.
   */
  writeBuffer(
    queue: unknown,
    buffer: unknown,
    hostData: ArrayBufferView,
  ): void {
    cl.enqueueWriteBuffer(
      queue as TClQueue,
      buffer as TClMem,
      true,
      0,
      hostData.byteLength,
      hostData,
    );
  }

  /**
   * Downloads `buffer`'s contents into `hostData`, via `cl.enqueueReadBuffer` with
   * `blockingRead: true` so the call only returns once the transfer has actually finished.
   */
  readBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void {
    cl.enqueueReadBuffer(
      queue as TClQueue,
      buffer as TClMem,
      true,
      0,
      hostData.byteLength,
      hostData,
    );
  }

  /** Compiles `source` into an as-yet-unbuilt program, via `cl.createProgramWithSource`. */
  createProgram(context: unknown, source: string): unknown {
    return cl.createProgramWithSource(context as TClContext, source);
  }

  /**
   * Builds a program for `device`, via `cl.buildProgram`.
   *
   * @throws {Error} `@node-3d/opencl` itself throws when the OpenCL C source fails to
   * compile — this rethrows without the build log; callers should catch and call
   * `getProgramBuildLog` to find out why.
   */
  buildProgram(program: unknown, device: unknown): void {
    cl.buildProgram(program as TClProgram, [device as TClDevice]);
  }

  /** The most recent build's compiler output for `device`, via `cl.getProgramBuildInfo`'s `PROGRAM_BUILD_LOG` field. */
  getProgramBuildLog(program: unknown, device: unknown): string {
    return cl.getProgramBuildInfo(
      program as TClProgram,
      device as TClDevice,
      cl.PROGRAM_BUILD_LOG,
    ) as string;
  }

  /** Releases a program, via `cl.releaseProgram`. */
  releaseProgram(program: unknown): void {
    cl.releaseProgram(program as TClProgram);
  }

  /** Fetches the kernel named `name` from a built `program`, via `cl.createKernel`. */
  createKernel(program: unknown, name: string): unknown {
    return cl.createKernel(program as TClProgram, name);
  }

  /** Releases a kernel, via `cl.releaseKernel`. */
  releaseKernel(kernel: unknown): void {
    cl.releaseKernel(kernel as TClKernel);
  }

  /**
   * Sets `kernel`'s argument at `index`, via `cl.setKernelArg`. `cType` (e.g. `"float"`,
   * `"float*"`) tells the native binding how many bytes `value` occupies and how to
   * interpret it — unlike a typed language, `@node-3d/opencl` cannot infer this on its own.
   */
  setKernelArg(
    kernel: unknown,
    index: number,
    cType: string,
    value: unknown,
  ): void {
    cl.setKernelArg(kernel as TClKernel, index, cType, value);
  }

  /**
   * Launches `kernel` on `queue`, via `cl.enqueueNDRangeKernel`. `globalWorkSize.length`
   * is the work's dimensionality (1-3); no work-item offset and no explicit local
   * work-group size are given, letting the driver pick its own grouping.
   */
  enqueueKernel(
    queue: unknown,
    kernel: unknown,
    globalWorkSize: number[],
  ): void {
    cl.enqueueNDRangeKernel(
      queue as TClQueue,
      kernel as TClKernel,
      globalWorkSize.length,
      null,
      globalWorkSize,
    );
  }

  /** Blocks until every operation previously submitted to `queue` has completed, via `cl.finish`. */
  finish(queue: unknown): void {
    cl.finish(queue as TClQueue);
  }
}
