/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

/**
 * Base class for every OpenCL scalar value type (`Int8`, `Float32`, `Bool`, ...).
 *
 * In plain terms: a scalar always wraps a raw JS value (`TRaw`) that has already been
 * truncated or rounded, in its constructor, so it behaves exactly like its OpenCL C
 * counterpart — not like a plain JS `number` — from the moment it exists.
 */
export abstract class Scalar<TRaw> {
  protected readonly raw: TRaw;

  /**
   * Wraps `raw` via `wrap()` and stores the result.
   *
   * @param raw - The raw value to wrap.
   */
  protected constructor(raw: TRaw) {
    this.raw = this.wrap(raw);
  }

  /**
   * Truncates or rounds `raw` so it matches the exact numeric behavior of the OpenCL C type
   * this class represents — e.g. two's-complement wraparound for integers, 32-bit rounding
   * for `float`. Called once, from the constructor, on every new instance.
   *
   * @param raw - The raw value to truncate or round.
   * @returns The wrapped value.
   */
  protected abstract wrap(raw: TRaw): TRaw;

  /**
   * Returns the underlying raw JS value.
   *
   * @returns The wrapped raw value.
   */
  valueOf(): TRaw {
    return this.raw;
  }
}
