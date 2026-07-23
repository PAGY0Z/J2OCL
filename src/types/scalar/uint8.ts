/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new Uint8Array(1);

/**
 * OpenCL's `uchar` — an 8-bit unsigned integer (0 to 255). Arithmetic wraps around on
 * overflow, exactly like it would in C.
 */
export class UInt8 extends Scalar<number> {
  /**
   * @param raw - The raw value; `wrap()` truncates it to the 0..255 range.
   */
  private constructor(raw: number) {
    super(raw);
  }

  /**
   * Builds a `UInt8` from a raw JS number, truncating it to the 0..255 range.
   *
   * @param raw - The raw JS number to wrap.
   * @returns The resulting `UInt8`.
   */
  static of(raw: number): UInt8 {
    return new UInt8(raw);
  }

  /**
   * Truncates `raw` to the 0..255 range via a scratch `Uint8Array`.
   *
   * In plain terms: writing a too-large number into a fixed-size typed array truncates it
   * exactly the way a C `uint8_t` would — this scratch-array trick reproduces C's
   * wraparound without any hand-written bit-masking.
   *
   * @param raw - The raw value to truncate.
   * @returns The truncated value.
   */
  protected wrap(raw: number): number {
    scratch[0] = raw;
    return scratch[0];
  }

  /**
   * Adds `other` to this value, wrapping around on overflow like C's `uint8_t`.
   *
   * @param other - The value to add.
   * @returns The sum, wrapped to the valid range.
   */
  add(other: UInt8): UInt8 {
    return UInt8.of(this.raw + other.raw);
  }

  /**
   * Subtracts `other` from this value, wrapping around on underflow like C's `uint8_t`.
   *
   * @param other - The value to subtract.
   * @returns The difference, wrapped to the valid range.
   */
  sub(other: UInt8): UInt8 {
    return UInt8.of(this.raw - other.raw);
  }

  /**
   * Multiplies this value by `other`, wrapping around on overflow like C's `uint8_t`.
   *
   * @param other - The value to multiply by.
   * @returns The product, wrapped to the valid range.
   */
  mul(other: UInt8): UInt8 {
    return UInt8.of(this.raw * other.raw);
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
  div(other: UInt8): UInt8 {
    if (other.raw === 0) {
      throw new Error('UInt8: division by zero');
    }
    return UInt8.of(Math.trunc(this.raw / other.raw));
  }

  /**
   * The remainder of dividing this value by `other`.
   *
   * @param other - The divisor.
   * @returns The remainder, wrapped to the valid range.
   * @throws {Error} If `other` is zero — see `div()`.
   */
  mod(other: UInt8): UInt8 {
    if (other.raw === 0) {
      throw new Error('UInt8: division by zero');
    }
    return UInt8.of(this.raw % other.raw);
  }

  /**
   * The negation of this value, wrapping via modular arithmetic like C's `uint8_t`.
   *
   * @returns The negated value, wrapped to the valid range.
   */
  negate(): UInt8 {
    return UInt8.of(-this.raw);
  }

  /**
   * Checks whether this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than `other`.
   */
  greaterThan(other: UInt8): Bool {
    return Bool.of(this.raw > other.raw);
  }

  /**
   * Checks whether this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than `other`.
   */
  lessThan(other: UInt8): Bool {
    return Bool.of(this.raw < other.raw);
  }

  /**
   * Checks whether this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than or equal to `other`.
   */
  greaterThanOrEqual(other: UInt8): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  /**
   * Checks whether this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than or equal to `other`.
   */
  lessThanOrEqual(other: UInt8): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  /**
   * Checks whether this value and `other` are equal.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are equal.
   */
  equals(other: UInt8): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: UInt8): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  /**
   * The bitwise AND of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise AND, wrapped to the valid range.
   */
  bitwiseAnd(other: UInt8): UInt8 {
    return UInt8.of(this.raw & other.raw);
  }

  /**
   * The bitwise OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise OR, wrapped to the valid range.
   */
  bitwiseOr(other: UInt8): UInt8 {
    return UInt8.of(this.raw | other.raw);
  }

  /**
   * The bitwise exclusive OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise XOR, wrapped to the valid range.
   */
  bitwiseXor(other: UInt8): UInt8 {
    return UInt8.of(this.raw ^ other.raw);
  }

  /**
   * The bitwise complement of this value (every bit flipped).
   *
   * @returns The complement, wrapped to the valid range.
   */
  bitwiseNot(): UInt8 {
    return UInt8.of(~this.raw);
  }

  /**
   * Shifts this value left by `amount` bits, filling with zeros.
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftLeft(amount: UInt8): UInt8 {
    return UInt8.of(this.raw << amount.raw);
  }

  /**
   * Shifts this value right by `amount` bits, filling the vacated high bits with zeros.
   *
   * In plain terms: this is a *logical* shift, matching C's right shift on an unsigned type
   * (unlike signed types, where the vacated bits copy the sign bit instead). Uses JS's `>>>`
   * rather than `>>`, since `>>` would reinterpret a large unsigned value as negative first.
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftRight(amount: UInt8): UInt8 {
    return UInt8.of(this.raw >>> amount.raw);
  }
}
