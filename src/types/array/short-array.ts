/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int16 } from '../scalar/int16.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `short*` buffer — a flat array of `Int16` values, backed by a real native
 * `Int16Array` with zero copying.
 */
export class ShortArray {
  #raw: Int16Array;

  /**
   * @param raw - The native `Int16Array` backing this instance.
   */
  private constructor(raw: Int16Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `ShortArray` from plain JS numbers, truncating each to the Int16 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `ShortArray`.
   */
  static from(values: number[]): ShortArray {
    return new ShortArray(new Int16Array(values));
  }

  /**
   * Reads the element at `index` as an `Int16`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as an `Int16`.
   */
  get(index: UInt32): Int16 {
    return Int16.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Int16): void {
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
