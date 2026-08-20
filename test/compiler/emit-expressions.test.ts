/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from '../../src/compiler/ast-c/expressions.js';
import { IRAssignExpr, IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from '../../src/compiler/ir/expressions.js';
import { IrToCVisitor } from '../../src/compiler/emit.js';

describe('IrToCVisitor — expressions', () => {
  const visitor = new IrToCVisitor();

  it('emits IRLiteral(number, UInt32) as an unsigned-suffixed C literal', () => {
    const result = new IRLiteral(0, 'UInt32').accept(visitor);
    expect(result).toBeInstanceOf(CLiteral);
    expect((result as CLiteral).text).toBe('0u');
  });

  it('emits IRLiteral(number, Float32) as a float-suffixed C literal', () => {
    const result = new IRLiteral(1.5, 'Float32').accept(visitor);
    expect((result as CLiteral).text).toBe('1.5f');
  });

  it('emits a whole-number IRLiteral(number, Float32) with a decimal point', () => {
    const result = new IRLiteral(0, 'Float32').accept(visitor);
    expect((result as CLiteral).text).toBe('0.0f');
  });

  it('emits a negative whole-number IRLiteral(number, Float32) with a decimal point', () => {
    const result = new IRLiteral(-2, 'Float32').accept(visitor);
    expect((result as CLiteral).text).toBe('-2.0f');
  });

  it('emits a whole-number IRLiteral(number, Float64) with a decimal point', () => {
    const result = new IRLiteral(0, 'Float64').accept(visitor);
    expect((result as CLiteral).text).toBe('0.0');
  });

  it('emits IRLiteral(number, Int32) as a plain C literal', () => {
    const result = new IRLiteral(-1, 'Int32').accept(visitor);
    expect((result as CLiteral).text).toBe('-1');
  });

  it('emits IRLiteral(boolean, Bool) as true/false', () => {
    expect((new IRLiteral(true, 'Bool').accept(visitor) as CLiteral).text).toBe('true');
    expect((new IRLiteral(false, 'Bool').accept(visitor) as CLiteral).text).toBe('false');
  });

  it('emits IRIdentifier as CIdentifier', () => {
    const result = new IRIdentifier('i', 'UInt32').accept(visitor);
    expect(result).toBeInstanceOf(CIdentifier);
    expect((result as CIdentifier).name).toBe('i');
  });

  it('emits an operator IRMethodCall (e.g. add) as a CBinaryExpr', () => {
    const call = new IRMethodCall(new IRIdentifier('i', 'UInt32'), 'add', [new IRLiteral(1, 'UInt32')], 'UInt32');
    const result = call.accept(visitor);
    expect(result).toBeInstanceOf(CBinaryExpr);
    expect((result as CBinaryExpr).operator).toBe('+');
  });

  it('emits a unary-operator IRMethodCall (e.g. negate) as a CUnaryExpr', () => {
    const call = new IRMethodCall(new IRIdentifier('i', 'Int32'), 'negate', [], 'Int32');
    const result = call.accept(visitor);
    expect(result).toBeInstanceOf(CUnaryExpr);
    expect((result as CUnaryExpr).operator).toBe('-');
  });

  it('emits a .get(i) IRMethodCall as a CIndexExpr', () => {
    const call = new IRMethodCall(new IRIdentifier('a', 'FloatArray'), 'get', [new IRIdentifier('i', 'UInt32')], 'Float32');
    const result = call.accept(visitor);
    expect(result).toBeInstanceOf(CIndexExpr);
    expect((result as CIndexExpr).target).toBeInstanceOf(CIdentifier);
  });

  it('emits IRIntrinsicCall("getGlobalId", [0]) as get_global_id(0)', () => {
    const call = new IRIntrinsicCall('getGlobalId', [new IRLiteral(0, 'UInt32')], 'UInt32');
    const result = call.accept(visitor);
    expect(result).toBeInstanceOf(CCall);
    expect((result as CCall).callee).toBe('get_global_id');
  });

  it('emits IRAssignExpr as CAssignExpr', () => {
    const assign = new IRAssignExpr(new IRIdentifier('i', 'UInt32'), new IRLiteral(1, 'UInt32'), 'UInt32');
    const result = assign.accept(visitor);
    expect(result.constructor.name).toBe('CAssignExpr');
  });
});
