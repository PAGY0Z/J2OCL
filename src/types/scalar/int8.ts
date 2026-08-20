/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Int8Array(1);

export class Int8 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): Int8 {
    return new Int8(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: Int8): Int8 {
    return Int8.of(this.raw + other.raw);
  }

  sub(other: Int8): Int8 {
    return Int8.of(this.raw - other.raw);
  }

  mul(other: Int8): Int8 {
    return Int8.of(this.raw * other.raw);
  }

  div(other: Int8): Int8 {
    if (other.raw === 0) {
      throw new Error('Int8: division by zero');
    }
    return Int8.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: Int8): Int8 {
    if (other.raw === 0) {
      throw new Error('Int8: division by zero');
    }
    return Int8.of(this.raw % other.raw);
  }

  negate(): Int8 {
    return Int8.of(-this.raw);
  }

  greaterThan(other: Int8): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Int8): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Int8): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Int8): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Int8): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Int8): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: Int8): Int8 {
    return Int8.of(this.raw & other.raw);
  }

  bitwiseOr(other: Int8): Int8 {
    return Int8.of(this.raw | other.raw);
  }

  bitwiseXor(other: Int8): Int8 {
    return Int8.of(this.raw ^ other.raw);
  }

  bitwiseNot(): Int8 {
    return Int8.of(~this.raw);
  }

  shiftLeft(amount: Int8): Int8 {
    return Int8.of(this.raw << amount.raw);
  }

  shiftRight(amount: Int8): Int8 {
    return Int8.of(this.raw >> amount.raw);
  }
}
