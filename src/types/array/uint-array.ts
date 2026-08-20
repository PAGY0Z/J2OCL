/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class UIntArray {
  #raw: Uint32Array;

  private constructor(raw: Uint32Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): UIntArray {
    return new UIntArray(new Uint32Array(values));
  }

  get(index: UInt32): UInt32 {
    return UInt32.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: UInt32): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
