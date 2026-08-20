/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Int64 } from '../scalar/int64.js';
import { UInt32 } from '../scalar/uint32.js';
import { registerRaw } from './raw-access.js';

export class LongArray {
  #raw: BigInt64Array;

  private constructor(raw: BigInt64Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: bigint[]): LongArray {
    return new LongArray(new BigInt64Array(values));
  }

  get(index: UInt32): Int64 {
    return Int64.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: Int64): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
