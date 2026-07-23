/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

const scratch = new BigUint64Array(1);

/**
 * OpenCL's `ulong` — a 64-bit unsigned integer. Backed by a JS `bigint`, for the same
 * precision reason as `Int64`. Arithmetic wraps around on overflow, exactly like it would in
 * C.
 */
export class UInt64 extends Scalar<bigint> {
  /**
   * @param raw - The raw value; `wrap()` truncates it to the 64-bit unsigned range.
   */
  private constructor(raw: bigint) {
    super(raw);
  }

  /**
   * Builds a `UInt64` from a raw `bigint`, truncating it to 64-bit unsigned range.
   *
   * @param raw - The raw `bigint` to wrap.
   * @returns The resulting `UInt64`.
   */
  static of(raw: bigint): UInt64 {
    return new UInt64(raw);
  }

  /**
   * Truncates `raw` to the 64-bit unsigned range via a scratch `BigUint64Array`.
   *
   * In plain terms: writing a too-large value into a fixed-size typed array truncates it
   * exactly the way a C `uint64_t` would — the same scratch-array trick every integer
   * scalar here uses, just with a `bigint`-backed typed array instead of a `number`-backed
   * one.
   *
   * @param raw - The raw value to truncate.
   * @returns The truncated value.
   */
  protected wrap(raw: bigint): bigint {
    scratch[0] = raw;
    return scratch[0];
  }

  /**
   * Adds `other` to this value, wrapping around on overflow like C's `uint64_t`.
   *
   * @param other - The value to add.
   * @returns The sum, wrapped to the valid range.
   */
  add(other: UInt64): UInt64 {
    return UInt64.of(this.raw + other.raw);
  }

  /**
   * Subtracts `other` from this value, wrapping around on underflow like C's `uint64_t`.
   *
   * @param other - The value to subtract.
   * @returns The difference, wrapped to the valid range.
   */
  sub(other: UInt64): UInt64 {
    return UInt64.of(this.raw - other.raw);
  }

  /**
   * Multiplies this value by `other`, wrapping around on overflow like C's `uint64_t`.
   *
   * @param other - The value to multiply by.
   * @returns The product, wrapped to the valid range.
   */
  mul(other: UInt64): UInt64 {
    return UInt64.of(this.raw * other.raw);
  }

  /**
   * Divides this value by `other`. `bigint` division already truncates toward zero, matching
   * C's integer division.
   *
   * In plain terms: real OpenCL hardware disagrees on what to do when dividing by zero —
   * some processors trap, others silently return 0 — so there is no single value that would
   * be faithful to every real GPU. This throws instead of arbitrarily picking one.
   *
   * @param other - The divisor.
   * @returns The quotient, truncated toward zero and wrapped to the valid range.
   * @throws {Error} If `other` is zero.
   */
  div(other: UInt64): UInt64 {
    if (other.raw === 0n) {
      throw new Error('UInt64: division by zero');
    }
    return UInt64.of(this.raw / other.raw);
  }

  /**
   * The remainder of dividing this value by `other`.
   *
   * @param other - The divisor.
   * @returns The remainder, wrapped to the valid range.
   * @throws {Error} If `other` is zero — see `div()`.
   */
  mod(other: UInt64): UInt64 {
    if (other.raw === 0n) {
      throw new Error('UInt64: division by zero');
    }
    return UInt64.of(this.raw % other.raw);
  }

  /**
   * The negation of this value, wrapping via modular arithmetic like C's `uint64_t`.
   *
   * @returns The negated value, wrapped to the valid range.
   */
  negate(): UInt64 {
    return UInt64.of(-this.raw);
  }

  /**
   * Checks whether this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than `other`.
   */
  greaterThan(other: UInt64): Bool {
    return Bool.of(this.raw > other.raw);
  }

  /**
   * Checks whether this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than `other`.
   */
  lessThan(other: UInt64): Bool {
    return Bool.of(this.raw < other.raw);
  }

  /**
   * Checks whether this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than or equal to `other`.
   */
  greaterThanOrEqual(other: UInt64): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  /**
   * Checks whether this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than or equal to `other`.
   */
  lessThanOrEqual(other: UInt64): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  /**
   * Checks whether this value and `other` are equal.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are equal.
   */
  equals(other: UInt64): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: UInt64): Bool {
    return Bool.of(this.raw !== other.raw);
  }

  /**
   * The bitwise AND of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise AND, wrapped to the valid range.
   */
  bitwiseAnd(other: UInt64): UInt64 {
    return UInt64.of(this.raw & other.raw);
  }

  /**
   * The bitwise OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise OR, wrapped to the valid range.
   */
  bitwiseOr(other: UInt64): UInt64 {
    return UInt64.of(this.raw | other.raw);
  }

  /**
   * The bitwise exclusive OR of this value and `other`.
   *
   * @param other - The value to combine with.
   * @returns The bitwise XOR, wrapped to the valid range.
   */
  bitwiseXor(other: UInt64): UInt64 {
    return UInt64.of(this.raw ^ other.raw);
  }

  /**
   * The bitwise complement of this value (every bit flipped).
   *
   * @returns The complement, wrapped to the valid range.
   */
  bitwiseNot(): UInt64 {
    return UInt64.of(~this.raw);
  }

  /**
   * Shifts this value left by `amount` bits, filling with zeros.
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftLeft(amount: UInt64): UInt64 {
    return UInt64.of(this.raw << amount.raw);
  }

  /**
   * Shifts this value right by `amount` bits, filling the vacated high bits with zeros.
   *
   * In plain terms: `bigint` has no `>>>` (unsigned right shift) operator at all — JS throws
   * if you try. But `bigint`'s native `>>` treats its operand as an arbitrary-precision
   * integer, not a fixed-width one, so on the non-negative value `wrap()` always guarantees
   * here, `>>` already behaves exactly like a logical shift (there's no sign bit to
   * mishandle), with no risk of the reinterpretation problem `UInt32.shiftRight()` has to
   * guard against.
   *
   * @param amount - The number of bits to shift by.
   * @returns The shifted value, wrapped to the valid range.
   */
  shiftRight(amount: UInt64): UInt64 {
    return UInt64.of(this.raw >> amount.raw);
  }
}
