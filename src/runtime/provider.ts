/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

/** Which kind of physical/logical compute unit an OpenCL device represents. */
export type DeviceKind = 'cpu' | 'gpu' | 'accelerator' | 'default';

/**
 * Which direction(s) a kernel is allowed to access a buffer through.
 *
 * In plain terms: this describes what the *kernel* may do with the buffer, not what host
 * code may do — host code can always read/write a buffer via `CommandQueue`, regardless
 * of this value. `'readOnly'` means "the kernel only reads this" (a typical input),
 * `'writeOnly'` means "the kernel only writes this" (a typical output), `'readWrite'`
 * allows both.
 */
export type BufferAccess = 'readOnly' | 'writeOnly' | 'readWrite';

/**
 * The seam between `src/host-api/` and a real OpenCL binding. Every handle
 * (platform/device/context/queue/buffer/program/kernel) is passed around as `unknown` —
 * `host-api` never inspects it, only stores it and hands it back to the same provider
 * that produced it. This is a small, purpose-built subset of OpenCL's operations (not a
 * 1:1 mirror of the whole C API), kept deliberately minimal so a test double implementing
 * it (see `test/host-api/fake-provider.ts`) stays easy to write and easy to trust.
 *
 * In plain terms: OpenCL organizes GPU computing into a fixed hierarchy of objects, and
 * this interface has methods for creating/releasing most of them — a `platform` is one
 * vendor's OpenCL driver (e.g. NVIDIA's own implementation), which exposes one or more
 * `device`s (a specific GPU/CPU/accelerator); a `context` binds work to one device; a
 * `queue` is the ordered pipeline every data transfer and kernel launch is submitted
 * through; a `buffer` is memory allocated on the device; a `program` is a whole compiled
 * `.cl` source file, from which one or more named `kernel`s (individual `__kernel`
 * functions) can be fetched and launched.
 *
 * `NodeOpenCLProvider` (`src/runtime/node-3d-opencl-provider.ts`) is the only production
 * implementation, and the only file in the whole project allowed to import
 * `@node-3d/opencl` directly.
 */
export interface OpenCLProvider {
  /** Every OpenCL platform (vendor driver) available on this machine. */
  listPlatforms(): unknown[];
  /** A platform's human-readable name, e.g. `"NVIDIA CUDA"`. */
  getPlatformName(platform: unknown): string;
  /** Every device (GPU/CPU/accelerator) `platform` exposes. */
  listDevices(platform: unknown): unknown[];
  /** A device's human-readable name, e.g. `"NVIDIA GeForce RTX 3050"`. */
  getDeviceName(device: unknown): string;
  /** Which kind of compute unit `device` is. */
  getDeviceKind(device: unknown): DeviceKind;

  /** Creates a context bound to `device` — the starting point for queues/buffers/programs. */
  createContext(device: unknown): unknown;
  /** Releases a context created by `createContext`. */
  releaseContext(context: unknown): void;

  /** Creates an in-order command queue on `context`, for `device`. */
  createCommandQueue(context: unknown, device: unknown): unknown;
  /** Releases a command queue created by `createCommandQueue`. */
  releaseCommandQueue(queue: unknown): void;

  /** Allocates a `byteLength`-byte buffer on `context`'s device, accessible per `access`. */
  createBuffer(
    context: unknown,
    byteLength: number,
    access: BufferAccess,
  ): unknown;
  /** Releases a buffer created by `createBuffer`. */
  releaseBuffer(buffer: unknown): void;
  /** Uploads `hostData` into `buffer` via `queue`, blocking until the transfer completes. */
  writeBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void;
  /** Downloads `buffer`'s contents into `hostData` via `queue`, blocking until the transfer completes. */
  readBuffer(queue: unknown, buffer: unknown, hostData: ArrayBufferView): void;

  /** Loads `source` (OpenCL C text) into a new, as-yet-unbuilt program on `context`. */
  createProgram(context: unknown, source: string): unknown;
  /**
   * Builds a program (from `createProgram`) for `device` — this is the step that
   * actually compiles its OpenCL C source.
   *
   * @throws {Error} If the program fails to build — call `getProgramBuildLog` to find
   * out why.
   */
  buildProgram(program: unknown, device: unknown): void;
  /** The compiler's human-readable output from the most recent `buildProgram` call, for `device`. */
  getProgramBuildLog(program: unknown, device: unknown): string;
  /** Releases a program created by `createProgram`. */
  releaseProgram(program: unknown): void;

  /** Fetches the kernel named `name` from a built `program`. */
  createKernel(program: unknown, name: string): unknown;
  /** Releases a kernel created by `createKernel`. */
  releaseKernel(kernel: unknown): void;
  /**
   * Sets `kernel`'s argument at `index` (0-based) to `value`, described by its OpenCL C
   * type `cType` (e.g. `"float"` for a scalar, `"float*"` for a buffer) — needed because
   * `value` alone doesn't tell the underlying binding how many bytes it occupies.
   */
  setKernelArg(
    kernel: unknown,
    index: number,
    cType: string,
    value: unknown,
  ): void;

  /**
   * Submits `kernel` to `queue` for execution, launching one work-item per unit of work
   * implied by `globalWorkSize` (one entry per dimension, so `[100]` runs 100 work-items
   * in parallel, each able to look up its own index via `getGlobalId(0)`).
   */
  enqueueKernel(
    queue: unknown,
    kernel: unknown,
    globalWorkSize: number[],
  ): void;
  /** Blocks until every operation previously submitted to `queue` has completed. */
  finish(queue: unknown): void;
}
