/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt16 } from '../scalar/uint16.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `ushort*` buffer — a flat array of `UInt16` values, backed by a real native
 * `Uint16Array` with zero copying.
 */
export class UShortArray {
  #raw: Uint16Array;

  /**
   * @param raw - The native `Uint16Array` backing this instance.
   */
  private constructor(raw: Uint16Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `UShortArray` from plain JS numbers, truncating each to the UInt16 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `UShortArray`.
   */
  static from(values: number[]): UShortArray {
    return new UShortArray(new Uint16Array(values));
  }

  /**
   * Reads the element at `index` as a `UInt16`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `UInt16`.
   */
  get(index: UInt32): UInt16 {
    return UInt16.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: UInt16): void {
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
