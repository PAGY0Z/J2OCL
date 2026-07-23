/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

/**
 * OpenCL's `double` — a 64-bit IEEE 754 floating-point number.
 *
 * In plain terms: a JS `number` already is a 64-bit double, so `wrap()` needs no rounding,
 * unlike `Float32`. Using `double` in a real (built) kernel requires the device to support
 * the optional `cl_khr_fp64` extension — this has no effect on dev-mode (this class is plain
 * JS), but the future OpenCL C compiler backend must not assume `double` always compiles.
 * Has no `.mod()`: OpenCL C's `%` operator is integer-only, so there's no floating-point
 * remainder operator to implement (`fmod()` is a function, not an operator, and out of
 * scope here).
 */
export class Float64 extends Scalar<number> {
  /**
   * @param raw - The raw value; `wrap()` is the identity for `Float64`.
   */
  private constructor(raw: number) {
    super(raw);
  }

  /**
   * Builds a `Float64` from a raw JS number.
   *
   * @param raw - The raw JS number to wrap.
   * @returns The resulting `Float64`.
   */
  static of(raw: number): Float64 {
    return new Float64(raw);
  }

  /**
   * Returns `raw` unchanged — a JS `number` already is a 64-bit double.
   *
   * @param raw - The raw value.
   * @returns `raw`, unchanged.
   */
  protected wrap(raw: number): number {
    return raw;
  }

  /**
   * Adds `other` to this value.
   *
   * @param other - The value to add.
   * @returns The sum.
   */
  add(other: Float64): Float64 {
    return Float64.of(this.raw + other.raw);
  }

  /**
   * Subtracts `other` from this value.
   *
   * @param other - The value to subtract.
   * @returns The difference.
   */
  sub(other: Float64): Float64 {
    return Float64.of(this.raw - other.raw);
  }

  /**
   * Multiplies this value by `other`.
   *
   * @param other - The value to multiply by.
   * @returns The product.
   */
  mul(other: Float64): Float64 {
    return Float64.of(this.raw * other.raw);
  }

  /**
   * Divides this value by `other`. Never throws — dividing by zero is IEEE-754-defined
   * (±Infinity or NaN), which is already exactly what JS's native `/` produces for `number`.
   *
   * @param other - The divisor.
   * @returns The quotient.
   */
  div(other: Float64): Float64 {
    return Float64.of(this.raw / other.raw);
  }

  /**
   * The negation of this value.
   *
   * @returns The negated value.
   */
  negate(): Float64 {
    return Float64.of(-this.raw);
  }

  /**
   * Checks whether this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than `other`.
   */
  greaterThan(other: Float64): Bool {
    return Bool.of(this.raw > other.raw);
  }

  /**
   * Checks whether this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than `other`.
   */
  lessThan(other: Float64): Bool {
    return Bool.of(this.raw < other.raw);
  }

  /**
   * Checks whether this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than or equal to `other`.
   */
  greaterThanOrEqual(other: Float64): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  /**
   * Checks whether this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than or equal to `other`.
   */
  lessThanOrEqual(other: Float64): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  /**
   * Checks whether this value and `other` are equal.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are equal.
   */
  equals(other: Float64): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: Float64): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
