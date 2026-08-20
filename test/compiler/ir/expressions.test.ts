/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it, vi } from 'vitest';
import { IRAssignExpr, IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from '../../../src/compiler/ir/expressions.js';

describe('IRLiteral', () => {
  it('stores its value and type, and dispatches to visitLiteral', () => {
    const node = new IRLiteral(0, 'UInt32');
    expect(node.value).toBe(0);
    expect(node.type).toBe('UInt32');

    const visitor = { visitLiteral: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitLiteral).toHaveBeenCalledWith(node);
  });
});

describe('IRIdentifier', () => {
  it('stores its name and type, and dispatches to visitIdentifier', () => {
    const node = new IRIdentifier('i', 'UInt32');
    expect(node.name).toBe('i');
    expect(node.type).toBe('UInt32');

    const visitor = { visitIdentifier: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIdentifier).toHaveBeenCalledWith(node);
  });
});

describe('IRMethodCall', () => {
  it('stores receiver/methodName/args/type, and dispatches to visitMethodCall', () => {
    const receiver = new IRIdentifier('i', 'UInt32');
    const arg = new IRLiteral(1, 'UInt32');
    const node = new IRMethodCall(receiver, 'add', [arg], 'UInt32');

    expect(node.receiver).toBe(receiver);
    expect(node.methodName).toBe('add');
    expect(node.args).toEqual([arg]);
    expect(node.type).toBe('UInt32');

    const visitor = { visitMethodCall: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitMethodCall).toHaveBeenCalledWith(node);
  });
});

describe('IRIntrinsicCall', () => {
  it('stores name/args/type, and dispatches to visitIntrinsicCall', () => {
    const arg = new IRLiteral(0, 'UInt32');
    const node = new IRIntrinsicCall('getGlobalId', [arg], 'UInt32');

    expect(node.name).toBe('getGlobalId');
    expect(node.args).toEqual([arg]);
    expect(node.type).toBe('UInt32');

    const visitor = { visitIntrinsicCall: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIntrinsicCall).toHaveBeenCalledWith(node);
  });
});

describe('IRAssignExpr', () => {
  it('stores target/value/type, and dispatches to visitAssignExpr', () => {
    const target = new IRIdentifier('i', 'UInt32');
    const value = new IRLiteral(1, 'UInt32');
    const node = new IRAssignExpr(target, value, 'UInt32');

    expect(node.target).toBe(target);
    expect(node.value).toBe(value);
    expect(node.type).toBe('UInt32');

    const visitor = { visitAssignExpr: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitAssignExpr).toHaveBeenCalledWith(node);
  });
});
