/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it, vi } from 'vitest';
import { IRIdentifier, IRLiteral } from '../../../src/compiler/ir/expressions.js';
import { IRBlock, IRDoWhile, IRExpressionStatement, IRFor, IRIf, IRInvalid, IRVariableDeclaration, IRWhile } from '../../../src/compiler/ir/statements.js';

describe('IRBlock', () => {
  it('stores statements and dispatches to visitBlock', () => {
    const statement = new IRExpressionStatement(new IRLiteral(0, 'UInt32'));
    const node = new IRBlock([statement]);
    expect(node.statements).toEqual([statement]);

    const visitor = { visitBlock: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitBlock).toHaveBeenCalledWith(node);
  });
});

describe('IRVariableDeclaration', () => {
  it('stores name/type/initializer and dispatches to visitVariableDeclaration', () => {
    const initializer = new IRLiteral(0, 'UInt32');
    const node = new IRVariableDeclaration('i', 'UInt32', initializer);
    expect(node.name).toBe('i');
    expect(node.type).toBe('UInt32');
    expect(node.initializer).toBe(initializer);

    const visitor = { visitVariableDeclaration: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitVariableDeclaration).toHaveBeenCalledWith(node);
  });
});

describe('IRExpressionStatement', () => {
  it('stores expression and dispatches to visitExpressionStatement', () => {
    const expression = new IRLiteral(0, 'UInt32');
    const node = new IRExpressionStatement(expression);
    expect(node.expression).toBe(expression);

    const visitor = { visitExpressionStatement: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitExpressionStatement).toHaveBeenCalledWith(node);
  });
});

describe('IRIf', () => {
  it('stores condition/thenBranch/elseBranch and dispatches to visitIf', () => {
    const condition = new IRIdentifier('cond', 'Bool');
    const thenBranch = new IRBlock([]);
    const node = new IRIf(condition, thenBranch, undefined);
    expect(node.condition).toBe(condition);
    expect(node.thenBranch).toBe(thenBranch);
    expect(node.elseBranch).toBeUndefined();

    const visitor = { visitIf: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIf).toHaveBeenCalledWith(node);
  });
});

describe('IRFor', () => {
  it('stores init/condition/update/body and dispatches to visitFor', () => {
    const init = new IRVariableDeclaration('i', 'UInt32', new IRLiteral(0, 'UInt32'));
    const condition = new IRIdentifier('cond', 'Bool');
    const update = new IRIdentifier('i', 'UInt32');
    const body = new IRBlock([]);
    const node = new IRFor(init, condition, update, body);
    expect(node.init).toBe(init);
    expect(node.condition).toBe(condition);
    expect(node.update).toBe(update);
    expect(node.body).toBe(body);

    const visitor = { visitFor: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitFor).toHaveBeenCalledWith(node);
  });
});

describe('IRWhile', () => {
  it('stores condition/body and dispatches to visitWhile', () => {
    const condition = new IRIdentifier('cond', 'Bool');
    const body = new IRBlock([]);
    const node = new IRWhile(condition, body);

    const visitor = { visitWhile: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitWhile).toHaveBeenCalledWith(node);
  });
});

describe('IRDoWhile', () => {
  it('stores condition/body and dispatches to visitDoWhile', () => {
    const condition = new IRIdentifier('cond', 'Bool');
    const body = new IRBlock([]);
    const node = new IRDoWhile(condition, body);

    const visitor = { visitDoWhile: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitDoWhile).toHaveBeenCalledWith(node);
  });
});

describe('IRInvalid', () => {
  it('stores its diagnostic and dispatches to visitInvalid', () => {
    const diagnostic = { file: 'a.ts', line: 1, column: 1, message: 'nope' };
    const node = new IRInvalid(diagnostic);
    expect(node.diagnostic).toBe(diagnostic);

    const visitor = { visitInvalid: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitInvalid).toHaveBeenCalledWith(node);
  });
});
