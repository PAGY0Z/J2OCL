/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

export class Float64 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): Float64 {
    return new Float64(raw);
  }

  protected wrap(raw: number): number {
    return raw;
  }

  add(other: Float64): Float64 {
    return Float64.of(this.raw + other.raw);
  }

  sub(other: Float64): Float64 {
    return Float64.of(this.raw - other.raw);
  }

  mul(other: Float64): Float64 {
    return Float64.of(this.raw * other.raw);
  }

  div(other: Float64): Float64 {
    return Float64.of(this.raw / other.raw);
  }

  negate(): Float64 {
    return Float64.of(-this.raw);
  }

  greaterThan(other: Float64): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Float64): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Float64): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Float64): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Float64): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Float64): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
