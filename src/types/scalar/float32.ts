/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Bool } from './bool.js';
import { Scalar } from './scalar.js';

/**
 * OpenCL's `float` — a 32-bit IEEE 754 floating-point number.
 *
 * In plain terms: a plain JS `number` is a 64-bit double, so every value is rounded down to
 * 32-bit precision via `Math.fround`, matching what real `float` hardware would produce. Has
 * no `.mod()` — OpenCL C's `%` operator is integer-only; there is no floating-point remainder
 * operator (`fmod()` is a function, not an operator, and out of scope here).
 */
export class Float32 extends Scalar<number> {
  /**
   * @param raw - The raw value; `wrap()` rounds it to 32-bit float precision.
   */
  private constructor(raw: number) {
    super(raw);
  }

  /**
   * Builds a `Float32` from a raw JS number, rounding it to 32-bit float precision.
   *
   * @param raw - The raw JS number to wrap.
   * @returns The resulting `Float32`.
   */
  static of(raw: number): Float32 {
    return new Float32(raw);
  }

  /**
   * Rounds `raw` to 32-bit float precision.
   *
   * @param raw - The raw value to round.
   * @returns The rounded value.
   */
  protected wrap(raw: number): number {
    return Math.fround(raw);
  }

  /**
   * Adds `other` to this value, rounding the result to 32-bit float precision.
   *
   * @param other - The value to add.
   * @returns The sum, rounded to 32-bit float precision.
   */
  add(other: Float32): Float32 {
    return Float32.of(this.raw + other.raw);
  }

  /**
   * Subtracts `other` from this value, rounding the result to 32-bit float precision.
   *
   * @param other - The value to subtract.
   * @returns The difference, rounded to 32-bit float precision.
   */
  sub(other: Float32): Float32 {
    return Float32.of(this.raw - other.raw);
  }

  /**
   * Multiplies this value by `other`, rounding the result to 32-bit float precision.
   *
   * @param other - The value to multiply by.
   * @returns The product, rounded to 32-bit float precision.
   */
  mul(other: Float32): Float32 {
    return Float32.of(this.raw * other.raw);
  }

  /**
   * Divides this value by `other`, rounding the result to 32-bit float precision.
   *
   * In plain terms: unlike integer division, this never throws — dividing by zero is
   * IEEE-754-defined (±Infinity or NaN), which is already exactly what JS's native `/`
   * produces for `number`.
   *
   * @param other - The divisor.
   * @returns The quotient, rounded to 32-bit float precision.
   */
  div(other: Float32): Float32 {
    return Float32.of(this.raw / other.raw);
  }

  /**
   * The negation of this value.
   *
   * @returns The negated value.
   */
  negate(): Float32 {
    return Float32.of(-this.raw);
  }

  /**
   * Checks whether this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than `other`.
   */
  greaterThan(other: Float32): Bool {
    return Bool.of(this.raw > other.raw);
  }

  /**
   * Checks whether this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than `other`.
   */
  lessThan(other: Float32): Bool {
    return Bool.of(this.raw < other.raw);
  }

  /**
   * Checks whether this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is greater than or equal to `other`.
   */
  greaterThanOrEqual(other: Float32): Bool {
    return Bool.of(this.raw >= other.raw);
  }

  /**
   * Checks whether this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns True if this value is less than or equal to `other`.
   */
  lessThanOrEqual(other: Float32): Bool {
    return Bool.of(this.raw <= other.raw);
  }

  /**
   * Checks whether this value and `other` are equal.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are equal.
   */
  equals(other: Float32): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: Float32): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
