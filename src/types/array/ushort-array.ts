/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt16 } from '../scalar/uint16.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class UShortArray {
  #raw: Uint16Array;

  private constructor(raw: Uint16Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): UShortArray {
    return new UShortArray(new Uint16Array(values));
  }

  get(index: UInt32): UInt16 {
    return UInt16.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: UInt16): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
