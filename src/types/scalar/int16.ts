/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Int16Array(1);

export class Int16 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): Int16 {
    return new Int16(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: Int16): Int16 {
    return Int16.of(this.raw + other.raw);
  }

  sub(other: Int16): Int16 {
    return Int16.of(this.raw - other.raw);
  }

  mul(other: Int16): Int16 {
    return Int16.of(this.raw * other.raw);
  }

  div(other: Int16): Int16 {
    if (other.raw === 0) {
      throw new Error('Int16: division by zero');
    }
    return Int16.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: Int16): Int16 {
    if (other.raw === 0) {
      throw new Error('Int16: division by zero');
    }
    return Int16.of(this.raw % other.raw);
  }

  negate(): Int16 {
    return Int16.of(-this.raw);
  }

  greaterThan(other: Int16): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Int16): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Int16): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Int16): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Int16): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Int16): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: Int16): Int16 {
    return Int16.of(this.raw & other.raw);
  }

  bitwiseOr(other: Int16): Int16 {
    return Int16.of(this.raw | other.raw);
  }

  bitwiseXor(other: Int16): Int16 {
    return Int16.of(this.raw ^ other.raw);
  }

  bitwiseNot(): Int16 {
    return Int16.of(~this.raw);
  }

  shiftLeft(amount: Int16): Int16 {
    return Int16.of(this.raw << amount.raw);
  }

  shiftRight(amount: Int16): Int16 {
    return Int16.of(this.raw >> amount.raw);
  }
}
