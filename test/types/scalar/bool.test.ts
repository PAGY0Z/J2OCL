/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Bool } from '../../../src/types/scalar/bool.js';

describe('Bool', () => {
  it('and() is true only when both values are true', () => {
    expect(Bool.of(true).and(Bool.of(true))).toEqual(Bool.of(true));
    expect(Bool.of(true).and(Bool.of(false))).toEqual(Bool.of(false));
  });

  it('not() flips the value', () => {
    expect(Bool.of(true).not()).toEqual(Bool.of(false));
    expect(Bool.of(false).not()).toEqual(Bool.of(true));
  });

  it('equals() compares two values', () => {
    expect(Bool.of(true).equals(Bool.of(true))).toEqual(Bool.of(true));
    expect(Bool.of(true).equals(Bool.of(false))).toEqual(Bool.of(false));
  });

  it('or() is true when either value is true', () => {
    expect(Bool.of(true).or(Bool.of(false))).toEqual(Bool.of(true));
    expect(Bool.of(false).or(Bool.of(false))).toEqual(Bool.of(false));
  });

  it('notEquals() compares two values', () => {
    expect(Bool.of(true).notEquals(Bool.of(false))).toEqual(Bool.of(true));
    expect(Bool.of(true).notEquals(Bool.of(true))).toEqual(Bool.of(false));
  });
});
