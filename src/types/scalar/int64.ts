/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new BigInt64Array(1);

export class Int64 extends Scalar<bigint> {
  private constructor(raw: bigint) {
    super(raw);
  }

  static of(raw: bigint): Int64 {
    return new Int64(raw);
  }

  protected wrap(raw: bigint): bigint {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: Int64): Int64 {
    return Int64.of(this.raw + other.raw);
  }

  sub(other: Int64): Int64 {
    return Int64.of(this.raw - other.raw);
  }

  mul(other: Int64): Int64 {
    return Int64.of(this.raw * other.raw);
  }

  div(other: Int64): Int64 {
    if (other.raw === 0n) {
      throw new Error('Int64: division by zero');
    }
    return Int64.of(this.raw / other.raw);
  }

  mod(other: Int64): Int64 {
    if (other.raw === 0n) {
      throw new Error('Int64: division by zero');
    }
    return Int64.of(this.raw % other.raw);
  }

  negate(): Int64 {
    return Int64.of(-this.raw);
  }

  greaterThan(other: Int64): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: Int64): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: Int64): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: Int64): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: Int64): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: Int64): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: Int64): Int64 {
    return Int64.of(this.raw & other.raw);
  }

  bitwiseOr(other: Int64): Int64 {
    return Int64.of(this.raw | other.raw);
  }

  bitwiseXor(other: Int64): Int64 {
    return Int64.of(this.raw ^ other.raw);
  }

  bitwiseNot(): Int64 {
    return Int64.of(~this.raw);
  }

  shiftLeft(amount: Int64): Int64 {
    return Int64.of(this.raw << amount.raw);
  }

  shiftRight(amount: Int64): Int64 {
    return Int64.of(this.raw >> amount.raw);
  }
}
