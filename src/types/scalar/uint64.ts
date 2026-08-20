/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new BigUint64Array(1);

export class UInt64 extends Scalar<bigint> {
  private constructor(raw: bigint) {
    super(raw);
  }

  static of(raw: bigint): UInt64 {
    return new UInt64(raw);
  }

  protected wrap(raw: bigint): bigint {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: UInt64): UInt64 {
    return UInt64.of(this.raw + other.raw);
  }

  sub(other: UInt64): UInt64 {
    return UInt64.of(this.raw - other.raw);
  }

  mul(other: UInt64): UInt64 {
    return UInt64.of(this.raw * other.raw);
  }

  div(other: UInt64): UInt64 {
    if (other.raw === 0n) {
      throw new Error('UInt64: division by zero');
    }
    return UInt64.of(this.raw / other.raw);
  }

  mod(other: UInt64): UInt64 {
    if (other.raw === 0n) {
      throw new Error('UInt64: division by zero');
    }
    return UInt64.of(this.raw % other.raw);
  }

  negate(): UInt64 {
    return UInt64.of(-this.raw);
  }

  greaterThan(other: UInt64): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: UInt64): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: UInt64): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: UInt64): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: UInt64): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: UInt64): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: UInt64): UInt64 {
    return UInt64.of(this.raw & other.raw);
  }

  bitwiseOr(other: UInt64): UInt64 {
    return UInt64.of(this.raw | other.raw);
  }

  bitwiseXor(other: UInt64): UInt64 {
    return UInt64.of(this.raw ^ other.raw);
  }

  bitwiseNot(): UInt64 {
    return UInt64.of(~this.raw);
  }

  shiftLeft(amount: UInt64): UInt64 {
    return UInt64.of(this.raw << amount.raw);
  }

  shiftRight(amount: UInt64): UInt64 {
    return UInt64.of(this.raw >> amount.raw);
  }
}
