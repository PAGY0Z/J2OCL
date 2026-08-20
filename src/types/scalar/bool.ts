/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { Scalar } from './scalar.js';

export class Bool extends Scalar<boolean> {
  private constructor(raw: boolean) {
    super(raw);
  }

  static of(raw: boolean): Bool {
    return new Bool(raw);
  }

  protected wrap(raw: boolean): boolean {
    return raw;
  }

  and(other: Bool): Bool {
    return Bool.of(this.raw && other.raw);
  }

  not(): Bool {
    return Bool.of(!this.raw);
  }

  equals(other: Bool): Bool {
    return Bool.of(this.raw === other.raw);
  }

  or(other: Bool): Bool {
    return Bool.of(this.raw || other.raw);
  }

  notEquals(other: Bool): Bool {
    return Bool.of(this.raw !== other.raw);
  }
}
