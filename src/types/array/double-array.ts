/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Float64 } from '../scalar/float64.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class DoubleArray {
  #raw: Float64Array;

  private constructor(raw: Float64Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): DoubleArray {
    return new DoubleArray(new Float64Array(values));
  }

  get(index: UInt32): Float64 {
    return Float64.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Float64): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
