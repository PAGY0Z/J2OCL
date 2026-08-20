/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Uint32Array(1);

export class UInt32 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): UInt32 {
    return new UInt32(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: UInt32): UInt32 {
    return UInt32.of(this.raw + other.raw);
  }

  sub(other: UInt32): UInt32 {
    return UInt32.of(this.raw - other.raw);
  }

  mul(other: UInt32): UInt32 {
    return UInt32.of(this.raw * other.raw);
  }

  div(other: UInt32): UInt32 {
    if (other.raw === 0) {
      throw new Error('UInt32: division by zero');
    }
    return UInt32.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: UInt32): UInt32 {
    if (other.raw === 0) {
      throw new Error('UInt32: division by zero');
    }
    return UInt32.of(this.raw % other.raw);
  }

  negate(): UInt32 {
    return UInt32.of(-this.raw);
  }

  greaterThan(other: UInt32): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: UInt32): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: UInt32): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: UInt32): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: UInt32): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: UInt32): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: UInt32): UInt32 {
    return UInt32.of(this.raw & other.raw);
  }

  bitwiseOr(other: UInt32): UInt32 {
    return UInt32.of(this.raw | other.raw);
  }

  bitwiseXor(other: UInt32): UInt32 {
    return UInt32.of(this.raw ^ other.raw);
  }

  bitwiseNot(): UInt32 {
    return UInt32.of(~this.raw);
  }

  shiftLeft(amount: UInt32): UInt32 {
    return UInt32.of(this.raw << amount.raw);
  }

  shiftRight(amount: UInt32): UInt32 {
    return UInt32.of(this.raw >>> amount.raw);
  }
}
