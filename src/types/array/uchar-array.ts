/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';
import { UInt8 } from '../scalar/uint8.js';

/**
 * OpenCL's `uchar*` buffer — a flat array of `UInt8` values, backed by a real native
 * `Uint8Array` with zero copying.
 */
export class UCharArray {
  #raw: Uint8Array;

  /**
   * @param raw - The native `Uint8Array` backing this instance.
   */
  private constructor(raw: Uint8Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `UCharArray` from plain JS numbers, truncating each to the UInt8 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `UCharArray`.
   */
  static from(values: number[]): UCharArray {
    return new UCharArray(new Uint8Array(values));
  }

  /**
   * Reads the element at `index` as a `UInt8`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `UInt8`.
   */
  get(index: UInt32): UInt8 {
    return UInt8.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: UInt8): void {
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
