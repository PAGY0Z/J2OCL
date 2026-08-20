/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int16 } from '../scalar/int16.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class ShortArray {
  #raw: Int16Array;

  private constructor(raw: Int16Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): ShortArray {
    return new ShortArray(new Int16Array(values));
  }

  get(index: UInt32): Int16 {
    return Int16.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Int16): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
