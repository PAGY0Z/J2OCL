/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

type RawBacking =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | BigInt64Array
  | BigUint64Array
  | Float32Array
  | Float64Array;

const rawBuffers = new WeakMap<object, RawBacking>();

/**
 * Registers `raw` as the native typed array backing `array`, so `getRawBuffer` can later
 * retrieve it. Called once, from the constructor, by every `src/types/array/*.ts` class.
 *
 * @param array - The J2OCL array instance (e.g. a `FloatArray`) to associate `raw` with.
 * @param raw - The native typed array backing `array`.
 */
export function registerRaw(array: object, raw: RawBacking): void {
  rawBuffers.set(array, raw);
}

/**
 * Retrieves the native typed array backing a J2OCL array instance, registered via
 * `registerRaw`.
 *
 * In plain terms: this is the only way to reach a `FloatArray`/`IntArray`/etc.'s
 * underlying `TypedArray` from outside `src/types/array/`, where it is otherwise a fully
 * private `#raw` field. It exists so `src/host-api/` can hand that memory directly to
 * the underlying native OpenCL binding for zero-copy transfer, without adding a new
 * public property that kernel-writing code could misuse — this module is never
 * re-exported from `src/types/index.ts`, so it stays invisible to a developer writing a
 * kernel.
 *
 * @param array - The J2OCL array instance to retrieve the backing typed array for.
 * @returns The native typed array backing `array`.
 * @throws {Error} If `array` was never registered — meaning it is not a real J2OCL array
 * instance built by one of the classes in this directory.
 */
export function getRawBuffer(array: object): RawBacking {
  const raw = rawBuffers.get(array);
  if (!raw) {
    throw new Error('getRawBuffer: not a registered J2OCL array instance');
  }
  return raw;
}
