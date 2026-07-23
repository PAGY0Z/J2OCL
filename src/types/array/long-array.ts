/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int64 } from '../scalar/int64.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `long*` buffer — a flat array of `Int64` values, backed by a real native
 * `BigInt64Array` with zero copying. Values are `bigint`, not `number` — same reason as
 * `Int64` itself: a `number` can't represent the full 64-bit range exactly.
 */
export class LongArray {
  #raw: BigInt64Array;

  /**
   * @param raw - The native `BigInt64Array` backing this instance.
   */
  private constructor(raw: BigInt64Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `LongArray` from raw `bigint`s, truncating each to the Int64 range.
   *
   * @param values - The raw `bigint`s to wrap.
   * @returns The resulting `LongArray`.
   */
  static from(values: bigint[]): LongArray {
    return new LongArray(new BigInt64Array(values));
  }

  /**
   * Reads the element at `index` as an `Int64`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as an `Int64`.
   */
  get(index: UInt32): Int64 {
    return Int64.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Int64): void {
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
