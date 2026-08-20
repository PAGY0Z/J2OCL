/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Int32Array(1);

export class Int32 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): Int32 {
    return new Int32(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: Int32): Int32 {
    return Int32.of(this.raw + other.raw);
  }

  sub(other: Int32): Int32 {
    return Int32.of(this.raw - other.raw);
  }

  mul(other: Int32): Int32 {
    return Int32.of(this.raw * other.raw);
  }

  div(other: Int32): Int32 {
    if (other.raw === 0) {
      throw new Error('Int32: division by zero');
    }
    return Int32.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: Int32): Int32 {
    if (other.raw === 0) {
      throw new Error('Int32: division by zero');
    }
    return Int32.of(this.raw % other.raw);
  }

  negate(): Int32 {
    return Int32.of(-this.raw);
  }

  greaterThan(other: Int32): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Int32): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Int32): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Int32): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Int32): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Int32): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: Int32): Int32 {
    return Int32.of(this.raw & other.raw);
  }

  bitwiseOr(other: Int32): Int32 {
    return Int32.of(this.raw | other.raw);
  }

  bitwiseXor(other: Int32): Int32 {
    return Int32.of(this.raw ^ other.raw);
  }

  bitwiseNot(): Int32 {
    return Int32.of(~this.raw);
  }

  shiftLeft(amount: Int32): Int32 {
    return Int32.of(this.raw << amount.raw);
  }

  shiftRight(amount: Int32): Int32 {
    return Int32.of(this.raw >> amount.raw);
  }
}
