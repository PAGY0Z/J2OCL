/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int32 } from '../scalar/int32.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `int*` buffer — a flat array of `Int32` values, backed by a real native
 * `Int32Array` with zero copying.
 */
export class IntArray {
  #raw: Int32Array;

  /**
   * @param raw - The native `Int32Array` backing this instance.
   */
  private constructor(raw: Int32Array) {
    this.#raw = raw;
  }

  /**
   * Builds an `IntArray` from plain JS numbers, truncating each to the Int32 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `IntArray`.
   */
  static from(values: number[]): IntArray {
    return new IntArray(new Int32Array(values));
  }

  /**
   * Reads the element at `index` as an `Int32`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as an `Int32`.
   */
  get(index: UInt32): Int32 {
    return Int32.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Int32): void {
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
