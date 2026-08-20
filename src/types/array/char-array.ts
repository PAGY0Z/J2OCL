/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int8 } from '../scalar/int8.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class CharArray {
  #raw: Int8Array;

  private constructor(raw: Int8Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): CharArray {
    return new CharArray(new Int8Array(values));
  }

  get(index: UInt32): Int8 {
    return Int8.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Int8): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
