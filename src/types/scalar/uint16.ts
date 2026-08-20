/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Uint16Array(1);

export class UInt16 extends Scalar<number> {
  private constructor(raw: number) {
    super(raw);
  }

  static of(raw: number): UInt16 {
    return new UInt16(raw);
  }

  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  add(other: UInt16): UInt16 {
    return UInt16.of(this.raw + other.raw);
  }

  sub(other: UInt16): UInt16 {
    return UInt16.of(this.raw - other.raw);
  }

  mul(other: UInt16): UInt16 {
    return UInt16.of(this.raw * other.raw);
  }

  div(other: UInt16): UInt16 {
    if (other.raw === 0) {
      throw new Error('UInt16: division by zero');
    }
    return UInt16.of(Math.trunc(this.raw / other.raw));
  }

  mod(other: UInt16): UInt16 {
    if (other.raw === 0) {
      throw new Error('UInt16: division by zero');
    }
    return UInt16.of(this.raw % other.raw);
  }

  negate(): UInt16 {
    return UInt16.of(-this.raw);
  }

  greaterThan(other: UInt16): Bool {
    return Bool.of(this.raw > other.raw);
  }

  lessThan(other: UInt16): Bool {
    return Bool.of(this.raw < other.raw);
  }

  greaterThanOrEqual(other: UInt16): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  lessThanOrEqual(other: UInt16): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  equals(other: UInt16): Bool {
    return Bool.of(this.raw === other.raw);
  }

  notEquals(other: UInt16): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  bitwiseAnd(other: UInt16): UInt16 {
    return UInt16.of(this.raw & other.raw);
  }

  bitwiseOr(other: UInt16): UInt16 {
    return UInt16.of(this.raw | other.raw);
  }

  bitwiseXor(other: UInt16): UInt16 {
    return UInt16.of(this.raw ^ other.raw);
  }

  bitwiseNot(): UInt16 {
    return UInt16.of(~this.raw);
  }

  shiftLeft(amount: UInt16): UInt16 {
    return UInt16.of(this.raw << amount.raw);
  }

  shiftRight(amount: UInt16): UInt16 {
    return UInt16.of(this.raw >>> amount.raw);
  }
}
