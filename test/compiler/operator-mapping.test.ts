/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { lookupOperator } from '../../src/compiler/operator-mapping.js';

describe('lookupOperator', () => {
  it('maps every arithmetic method to its binary C operator', () => {
    expect(lookupOperator('add')).toEqual({ kind: 'binary', symbol: '+' });
    expect(lookupOperator('sub')).toEqual({ kind: 'binary', symbol: '-' });
    expect(lookupOperator('mul')).toEqual({ kind: 'binary', symbol: '*' });
    expect(lookupOperator('div')).toEqual({ kind: 'binary', symbol: '/' });
    expect(lookupOperator('mod')).toEqual({ kind: 'binary', symbol: '%' });
  });

  it('maps comparison and equality methods to their binary C operators', () => {
    expect(lookupOperator('greaterThan')).toEqual({
      kind: 'binary',
      symbol: '>',
    });
    expect(lookupOperator('lessThan')).toEqual({ kind: 'binary', symbol: '<' });
    expect(lookupOperator('greaterThanOrEqual')).toEqual({
      kind: 'binary',
      symbol: '>=',
    });
    expect(lookupOperator('lessThanOrEqual')).toEqual({
      kind: 'binary',
      symbol: '<=',
    });
    expect(lookupOperator('equals')).toEqual({ kind: 'binary', symbol: '==' });
    expect(lookupOperator('notEquals')).toEqual({
      kind: 'binary',
      symbol: '!=',
    });
  });

  it('maps bitwise and shift methods to their binary C operators', () => {
    expect(lookupOperator('bitwiseAnd')).toEqual({
      kind: 'binary',
      symbol: '&',
    });
    expect(lookupOperator('bitwiseOr')).toEqual({
      kind: 'binary',
      symbol: '|',
    });
    expect(lookupOperator('bitwiseXor')).toEqual({
      kind: 'binary',
      symbol: '^',
    });
    expect(lookupOperator('shiftLeft')).toEqual({
      kind: 'binary',
      symbol: '<<',
    });
    expect(lookupOperator('shiftRight')).toEqual({
      kind: 'binary',
      symbol: '>>',
    });
  });

  it('maps logical methods to their binary C operators', () => {
    expect(lookupOperator('and')).toEqual({ kind: 'binary', symbol: '&&' });
    expect(lookupOperator('or')).toEqual({ kind: 'binary', symbol: '||' });
  });

  it('maps unary methods to their unary-prefix C operators', () => {
    expect(lookupOperator('negate')).toEqual({
      kind: 'unary-prefix',
      symbol: '-',
    });
    expect(lookupOperator('bitwiseNot')).toEqual({
      kind: 'unary-prefix',
      symbol: '~',
    });
    expect(lookupOperator('not')).toEqual({
      kind: 'unary-prefix',
      symbol: '!',
    });
  });

  it('returns undefined for get/set and for unknown method names', () => {
    expect(lookupOperator('get')).toBeUndefined();
    expect(lookupOperator('set')).toBeUndefined();
    expect(lookupOperator('somethingElse')).toBeUndefined();
  });

  it('returns undefined for names inherited from Object.prototype, not the inherited method itself', () => {
    expect(lookupOperator('valueOf')).toBeUndefined();
    expect(lookupOperator('toString')).toBeUndefined();
    expect(lookupOperator('constructor')).toBeUndefined();
    expect(lookupOperator('hasOwnProperty')).toBeUndefined();
    expect(lookupOperator('__proto__')).toBeUndefined();
  });
});
