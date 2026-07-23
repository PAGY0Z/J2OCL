/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `uint*` buffer — a flat array of `UInt32` values, backed by a real native
 * `Uint32Array` with zero copying.
 */
export class UIntArray {
  #raw: Uint32Array;

  /**
   * @param raw - The native `Uint32Array` backing this instance.
   */
  private constructor(raw: Uint32Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `UIntArray` from plain JS numbers, truncating each to the UInt32 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `UIntArray`.
   */
  static from(values: number[]): UIntArray {
    return new UIntArray(new Uint32Array(values));
  }

  /**
   * Reads the element at `index` as a `UInt32`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `UInt32`.
   */
  get(index: UInt32): UInt32 {
    return UInt32.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: UInt32): void {
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
