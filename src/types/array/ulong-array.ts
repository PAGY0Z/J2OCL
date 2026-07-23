/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';
import { UInt64 } from '../scalar/uint64.js';

/**
 * OpenCL's `ulong*` buffer — a flat array of `UInt64` values, backed by a real native
 * `BigUint64Array` with zero copying.
 */
export class ULongArray {
  #raw: BigUint64Array;

  /**
   * @param raw - The native `BigUint64Array` backing this instance.
   */
  private constructor(raw: BigUint64Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `ULongArray` from raw `bigint`s, truncating each to the UInt64 range.
   *
   * @param values - The raw `bigint`s to wrap.
   * @returns The resulting `ULongArray`.
   */
  static from(values: bigint[]): ULongArray {
    return new ULongArray(new BigUint64Array(values));
  }

  /**
   * Reads the element at `index` as a `UInt64`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as a `UInt64`.
   */
  get(index: UInt32): UInt64 {
    return UInt64.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: UInt64): void {
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
