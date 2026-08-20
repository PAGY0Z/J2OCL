/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int32 } from '../scalar/int32.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class IntArray {
  #raw: Int32Array;

  private constructor(raw: Int32Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): IntArray {
    return new IntArray(new Int32Array(values));
  }

  get(index: UInt32): Int32 {
    return Int32.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Int32): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
