/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Scalar } from './scalar.js';

/**
 * OpenCL's `bool` — used inside a kernel (e.g. as the result of a comparison like
 * `i.lessThan(n)`), but never as a buffer: the real OpenCL spec forbids `bool` as the type
 * of a kernel argument, since its size isn't fixed by the spec. `Bool` has no arithmetic —
 * only the logical operations a comparison result actually needs.
 */
export class Bool extends Scalar<boolean> {
  /**
   * @param raw - The raw boolean value.
   */
  private constructor(raw: boolean) {
    super(raw);
  }

  /**
   * Builds a `Bool` from a raw JS boolean.
   *
   * @param raw - The raw JS boolean to wrap.
   * @returns The resulting `Bool`.
   */
  static of(raw: boolean): Bool {
    return new Bool(raw);
  }

  /**
   * Returns `raw` unchanged — a JS `boolean` needs no truncation or rounding.
   *
   * @param raw - The raw value.
   * @returns `raw`, unchanged.
   */
  protected wrap(raw: boolean): boolean {
    return raw;
  }

  /**
   * Checks whether both this value and `other` are true.
   *
   * @param other - The value to combine with.
   * @returns True only if both values are true.
   */
  and(other: Bool): Bool {
    return Bool.of(this.raw && other.raw);
  }

  /**
   * The logical negation of this value.
   *
   * @returns The opposite of this value.
   */
  not(): Bool {
    return Bool.of(!this.raw);
  }

  /**
   * Checks whether this value and `other` are the same.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are the same.
   */
  equals(other: Bool): Bool {
    return Bool.of(this.raw === other.raw);
  }

  /**
   * Checks whether either this value or `other` is true.
   *
   * @param other - The value to combine with.
   * @returns True if either value is true.
   */
  or(other: Bool): Bool {
    return Bool.of(this.raw || other.raw);
  }

  /**
   * Checks whether this value and `other` are different.
   *
   * @param other - The value to compare against.
   * @returns True if the two values are different.
   */
  notEquals(other: Bool): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
