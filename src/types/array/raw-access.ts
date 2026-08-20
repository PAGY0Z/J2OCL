/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

type RawBacking = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Float32Array | Float64Array;

const rawBuffers = new WeakMap<object, RawBacking>();

export function registerRaw(array: object, raw: RawBacking): void {
  rawBuffers.set(array, raw);
}

export function getRawBuffer(array: object): RawBacking {
  const raw = rawBuffers.get(array);
  if (!raw) {
    throw new Error('getRawBuffer: not a registered J2OCL array instance');
  }
  return raw;
}
