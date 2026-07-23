/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Int32Array(1);

/**
 * OpenCL's `int` — a 32-bit signed integer (-2147483648 to 2147483647). Arithmetic wraps
 * around on overflow, exactly like it would in C.
 */
export class Int32 extends Scalar<number> {
  /**
   * @param raw - The raw value; `wrap()` truncates it to the -2147483648..2147483647 range.
   */
  private constructor(raw: number) {
    super(raw);
  }

  /**
   * Builds an `Int32` from a raw JS number, truncating it to 32-bit signed range.
   *
   * @param raw - The raw JS number to wrap.
   * @returns The resulting `Int32`.
   */
  static of(raw: number): Int32 {
    return new Int32(raw);
  }

  /**
   * Truncates `raw` to the 32-bit signed range via a scratch `Int32Array`.
   *
   * In plain terms: writing a too-large number into a fixed-size typed array truncates it
   * exactly the way a C `int32_t` would — this scratch-array trick reproduces C's
   * two's-complement wraparound without any hand-written bit-masking.
   *
   * @param raw - The raw value to truncate.
   * @returns The truncated value.
   */
  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  /**
   * Adds `other` to this value, wrapping around on overflow like C's `int32_t`.
   *
   * @param other - The value to add.
   * @returns The sum, wrapped to the valid range.
   */
  add(other: Int32): Int32 {
    return Int32.of(this.raw + other.raw);
  }

  /**
   * Subtracts `other` from this value, wrapping around on underflow like C's `int32_t`.
   *
   * @param other - The value to subtract.
   * @returns The difference, wrapped to the valid range.
   */
  sub(other: Int32): Int32 {
    return Int32.of(this.raw - other.raw);
  }

  /**
   * Multiplies this value by `other`, wrapping around on overflow like C's `int32_t`.
   *
   * @param other - The value to multiply by.
   * @returns The product, wrapped to the valid range.
   */
  mul(other: Int32): Int32 {
    return Int32.of(this.raw * other.raw);
  }

  /**
   * Divides this value by `other`, truncating toward zero like C's integer division.
   *
   * In plain terms: real OpenCL hardware disagrees on what to do when dividing by zero —
   * some processors trap, others silently return 0 — so there is no single value that would
   * be faithful to every real GPU. This throws instead of arbitrarily picking one.
   *
   * @param other - The divisor.
   * @returns The quotient, truncated toward zero and wrapped to the valid range.
   * @throws {Error} If `other` is zero.
   */
  div(other: Int32): Int32 {
    if (other.raw === 0) {
      throw new Error('Int32: division by zero');
    }
    return Int32.of(Math.trunc(this.raw / other.raw));
  }

  /**
   * The remainder of dividing this value by `other`, with the sign of this value.
   *
   * @param other - The divisor.
   * @returns The remainder, wrapped to the valid range.
   * @throws {Error} If `other` is zero — see `div()`.
   */
  mod(other: Int32): Int32 {
    if (other.raw === 0) {
      throw new Error('Int32: division by zero');
    }
    return Int32.of(this.raw % other.raw);
  }

  /**
   * The negation of this value, wrapping like C's `int32_t`.
   *
   * @returns The negated value, wrapped to the valid range.
   */
  negate(): Int32 {
    return Int32.of(-this.raw);
  }

  /**
   * Checks whether this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than `other`.
   */
  greaterThan(other: Int32): Bool {
    return Bool.of(this.raw > other.raw);
  }

  /**
   * Checks whether this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than `other`.
   */
  lessThan(other: Int32): Bool {
    return Bool.of(this.raw < other.raw);
  }

  /**
   * Checks whether this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than or equal to `other`.
   */
  greaterThanOrEqual(other: Int32): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  /**
   * Checks whether this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than or equal to `other`.
   */
  lessThanOrEqual(other: Int32): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  /**
   * Checks whether this value and `other` are equal.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are equal.
   */
  equals(other: Int32): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: Int32): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  /**
   * The bitwise AND of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise AND, wrapped to the valid range.
   */
  bitwiseAnd(other: Int32): Int32 {
    return Int32.of(this.raw & other.raw);
  }

  /**
   * The bitwise OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise OR, wrapped to the valid range.
   */
  bitwiseOr(other: Int32): Int32 {
    return Int32.of(this.raw | other.raw);
  }

  /**
   * The bitwise exclusive OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise XOR, wrapped to the valid range.
   */
  bitwiseXor(other: Int32): Int32 {
    return Int32.of(this.raw ^ other.raw);
  }

  /**
   * The bitwise complement of this value (every bit flipped).
   *
   * @returns The complement, wrapped to the valid range.
   */
  bitwiseNot(): Int32 {
    return Int32.of(~this.raw);
  }

  /**
   * Shifts this value left by `amount` bits, filling with zeros — the same for signed and
   * unsigned types.
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftLeft(amount: Int32): Int32 {
    return Int32.of(this.raw << amount.raw);
  }

  /**
   * Shifts this value right by `amount` bits.
   *
   * In plain terms: this is an *arithmetic* shift — it fills the vacated high bits with a
   * copy of the sign bit, matching C's right shift on a signed type (unlike unsigned types,
   * where the vacated bits are always filled with zeros).
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftRight(amount: Int32): Int32 {
    return Int32.of(this.raw >> amount.raw);
  }
}
