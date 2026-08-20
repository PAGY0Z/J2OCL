/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';
import { UInt8 } from '../scalar/uint8.js';
import { registerRaw } from './raw-access.js';

export class UCharArray {
  #raw: Uint8Array;

  private constructor(raw: Uint8Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): UCharArray {
    return new UCharArray(new Uint8Array(values));
  }

  get(index: UInt32): UInt8 {
    return UInt8.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: UInt8): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
