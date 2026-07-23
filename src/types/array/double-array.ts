/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Float64 } from '../scalar/float64.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `double*` buffer — a flat array of `Float64` values, backed by a real native
 * `Float64Array` with zero copying. Using `double` in a real (built) kernel requires the
 * target device to support the optional `cl_khr_fp64` extension — this has no effect on
 * dev-mode today, but a future OpenCL C compiler backend must not assume `double` always
 * compiles.
 */
export class DoubleArray {
  #raw: Float64Array;

  /**
   * @param raw - The native `Float64Array` backing this instance.
   */
  private constructor(raw: Float64Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `DoubleArray` from plain JS numbers.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `DoubleArray`.
   */
  static from(values: number[]): DoubleArray {
    return new DoubleArray(new Float64Array(values));
  }

  /**
   * Reads the element at `index` as a `Float64`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `Float64`.
   */
  get(index: UInt32): Float64 {
    return Float64.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Float64): void {
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
