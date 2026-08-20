/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { UInt32 } from '../scalar/uint32.js';
import { UInt64 } from '../scalar/uint64.js';
import { registerRaw } from './raw-access.js';

export class ULongArray {
  #raw: BigUint64Array;

  private constructor(raw: BigUint64Array) {
    this.#raw = raw;
    registerRaw(this, raw);
  }

  static from(values: bigint[]): ULongArray {
    return new ULongArray(new BigUint64Array(values));
  }

  get(index: UInt32): UInt64 {
    return UInt64.of(this.#raw[index.valueOf()]);
  }

  set(index: UInt32, value: UInt64): void {
    this.#raw[index.valueOf()] = value.valueOf();
  }

  get length(): UInt32 {
    return UInt32.of(this.#raw.length);
  }
}
