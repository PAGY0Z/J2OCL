/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Float32 } from '../scalar/float32.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class FloatArray {
  #raw: Float32Array;

  private constructor(raw: Float32Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: number[]): FloatArray {
    return new FloatArray(new Float32Array(values));
  }

  get(index: UInt32): Float32 {
    return Float32.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Float32): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
