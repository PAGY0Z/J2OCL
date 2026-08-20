/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

export class Float32 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): Float32 {
    return new Float32(raw);
  }

  protected wrap(raw: number): number {
    return Math.fround(raw);
  }

  add(other: Float32): Float32 {
    return Float32.of(this.raw + other.raw);
  }

  sub(other: Float32): Float32 {
    return Float32.of(this.raw - other.raw);
  }

  mul(other: Float32): Float32 {
    return Float32.of(this.raw * other.raw);
  }

  div(other: Float32): Float32 {
    return Float32.of(this.raw / other.raw);
  }

  negate(): Float32 {
    return Float32.of(-this.raw);
  }

  greaterThan(other: Float32): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Float32): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Float32): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Float32): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Float32): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Float32): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
