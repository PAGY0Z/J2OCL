/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int8 } from '../scalar/int8.js';
import { UInt32 } from '../scalar/uint32.js';

/**
 * OpenCL's `char*` buffer — a flat array of `Int8` values. Storage is always the real native
 * `Int8Array` underneath, never a copy, so the memory layout stays directly compatible with
 * what an OpenCL buffer expects.
 */
export class CharArray {
  #raw: Int8Array;

  /**
   * @param raw - The native `Int8Array` backing this instance.
   */
  private constructor(raw: Int8Array) {
    this.#raw = raw;
  }

  /**
   * Builds a `CharArray` from plain JS numbers, truncating each to the Int8 range.
   *
   * @param values - The raw JS numbers to wrap.
   * @returns The resulting `CharArray`.
   */
  static from(values: number[]): CharArray {
    return new CharArray(new Int8Array(values));
  }

  /**
   * Reads the element at `index` as an `Int8`.
   *
   * @param index - The element index.
   * @returns The element, wrapped as an `Int8`.
   */
  get(index: UInt32): Int8 {
    return Int8.of(this.#raw[index.valueOf()]);
  }

  /**
   * Overwrites the element at `index` with `value`.
   *
   * @param index - The element index.
   * @param value - The value to store.
   */
  set(index: UInt32, value: Int8): void {
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
