/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

export type OperatorKind = 'binary' | 'unary-prefix';

export interface OperatorMapping {
  kind: OperatorKind;
  symbol: string;
}

const METHOD_OPERATORS: ReadonlyMap<string, OperatorMapping> = new Map([
  ['add', { kind: 'binary', symbol: '+' }],
  ['sub', { kind: 'binary', symbol: '-' }],
  ['mul', { kind: 'binary', symbol: '*' }],
  ['div', { kind: 'binary', symbol: '/' }],
  ['mod', { kind: 'binary', symbol: '%' }],
  ['negate', { kind: 'unary-prefix', symbol: '-' }],
  ['greaterThan', { kind: 'binary', symbol: '>' }],
  ['lessThan', { kind: 'binary', symbol: '<' }],
  ['greaterThanOrEqual', { kind: 'binary', symbol: '>=' }],
  ['lessThanOrEqual', { kind: 'binary', symbol: '<=' }],
  ['equals', { kind: 'binary', symbol: '==' }],
  ['notEquals', { kind: 'binary', symbol: '!=' }],
  ['bitwiseAnd', { kind: 'binary', symbol: '&' }],
  ['bitwiseOr', { kind: 'binary', symbol: '|' }],
  ['bitwiseXor', { kind: 'binary', symbol: '^' }],
  ['bitwiseNot', { kind: 'unary-prefix', symbol: '~' }],
  ['shiftLeft', { kind: 'binary', symbol: '<<' }],
  ['shiftRight', { kind: 'binary', symbol: '>>' }],
  ['and', { kind: 'binary', symbol: '&&' }],
  ['or', { kind: 'binary', symbol: '||' }],
  ['not', { kind: 'unary-prefix', symbol: '!' }],
] satisfies [string, OperatorMapping][]);

export function lookupOperator(methodName: string): OperatorMapping | undefined {
  return METHOD_OPERATORS.get(methodName);
}
