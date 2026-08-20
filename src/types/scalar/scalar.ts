/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

export abstract class Scalar<TRaw> {
  protected readonly raw: TRaw;

  protected constructor(raw: TRaw) {
    this.raw = this.wrap(raw);
  }

  protected abstract wrap(raw: TRaw): TRaw;

  valueOf(): TRaw {
    return this.raw;
  }
}
