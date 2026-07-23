/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Float32 } from '../scalar/float32.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `float*` buffer — a flat array of `Float32` values, backed by a real native
 * `Float32Array` with zero copying.
 */
export class FloatArray {
  #raw: Float32Array;

  /**
   * @param raw - The native `Float32Array` backing this instance.
   */
  private constructor(raw: Float32Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `FloatArray` from plain JS numbers, rounding each to 32-bit float precision.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `FloatArray`.
   */
  static from(values: number[]): FloatArray {
    return new FloatArray(new Float32Array(values));
  }

  /**
   * Reads the element at `index` as a `Float32`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `Float32`.
   */
  get(index: UInt32): Float32 {
    return Float32.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Float32): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  /**
   * The number of elements in this array.
   *
   * @returns The element count.
   */
  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
