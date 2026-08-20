/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Uint8Array(1);

export class UInt8 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): UInt8 {
    return new UInt8(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: UInt8): UInt8 {
    return UInt8.of(this.raw + other.raw);
  }

  sub(other: UInt8): UInt8 {
    return UInt8.of(this.raw - other.raw);
  }

  mul(other: UInt8): UInt8 {
    return UInt8.of(this.raw * other.raw);
  }

  div(other: UInt8): UInt8 {
    if (other.raw === 0) {
      throw new Error('UInt8: division by zero');
    }
    return UInt8.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: UInt8): UInt8 {
    if (other.raw === 0) {
      throw new Error('UInt8: division by zero');
    }
    return UInt8.of(this.raw % other.raw);
  }

  negate(): UInt8 {
    return UInt8.of(-this.raw);
  }

  greaterThan(other: UInt8): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: UInt8): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: UInt8): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: UInt8): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: UInt8): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: UInt8): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: UInt8): UInt8 {
    return UInt8.of(this.raw & other.raw);
  }

  bitwiseOr(other: UInt8): UInt8 {
    return UInt8.of(this.raw | other.raw);
  }

  bitwiseXor(other: UInt8): UInt8 {
    return UInt8.of(this.raw ^ other.raw);
  }

  bitwiseNot(): UInt8 {
    return UInt8.of(~this.raw);
  }

  shiftLeft(amount: UInt8): UInt8 {
    return UInt8.of(this.raw << amount.raw);
  }

  shiftRight(amount: UInt8): UInt8 {
    return UInt8.of(this.raw >>> amount.raw);
  }
}
