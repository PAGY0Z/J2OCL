/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it, vi } from 'vitest';
import { CAssignExpr, CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from '../../../src/compiler/ast-c/expressions.js';

describe('CLiteral', () => {
  it('stores its text and dispatches to visitLiteral', () => {
    const node = new CLiteral('0u');
    expect(node.text).toBe('0u');

    const visitor = { visitLiteral: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitLiteral).toHaveBeenCalledWith(node);
  });
});

describe('CIdentifier', () => {
  it('stores its name and dispatches to visitIdentifier', () => {
    const node = new CIdentifier('i');
    expect(node.name).toBe('i');

    const visitor = { visitIdentifier: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIdentifier).toHaveBeenCalledWith(node);
  });
});

describe('CBinaryExpr', () => {
  it('stores operator/left/right and dispatches to visitBinaryExpr', () => {
    const left = new CIdentifier('i');
    const right = new CLiteral('1u');
    const node = new CBinaryExpr('+', left, right);
    expect(node.operator).toBe('+');
    expect(node.left).toBe(left);
    expect(node.right).toBe(right);

    const visitor = { visitBinaryExpr: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitBinaryExpr).toHaveBeenCalledWith(node);
  });
});

describe('CUnaryExpr', () => {
  it('stores operator/operand and dispatches to visitUnaryExpr', () => {
    const operand = new CIdentifier('i');
    const node = new CUnaryExpr('-', operand);
    expect(node.operator).toBe('-');
    expect(node.operand).toBe(operand);

    const visitor = { visitUnaryExpr: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitUnaryExpr).toHaveBeenCalledWith(node);
  });
});

describe('CAssignExpr', () => {
  it('stores target/value and dispatches to visitAssignExpr', () => {
    const target = new CIdentifier('i');
    const value = new CLiteral('1u');
    const node = new CAssignExpr(target, value);
    expect(node.target).toBe(target);
    expect(node.value).toBe(value);

    const visitor = { visitAssignExpr: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitAssignExpr).toHaveBeenCalledWith(node);
  });
});

describe('CCall', () => {
  it('stores callee/args and dispatches to visitCall', () => {
    const arg = new CLiteral('0');
    const node = new CCall('get_global_id', [arg]);
    expect(node.callee).toBe('get_global_id');
    expect(node.args).toEqual([arg]);

    const visitor = { visitCall: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitCall).toHaveBeenCalledWith(node);
  });
});

describe('CIndexExpr', () => {
  it('stores target/index and dispatches to visitIndexExpr', () => {
    const target = new CIdentifier('a');
    const index = new CIdentifier('i');
    const node = new CIndexExpr(target, index);
    expect(node.target).toBe(target);
    expect(node.index).toBe(index);

    const visitor = { visitIndexExpr: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIndexExpr).toHaveBeenCalledWith(node);
  });
});
