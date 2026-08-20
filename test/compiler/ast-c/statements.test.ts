/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it, vi } from 'vitest';
import { CIdentifier, CLiteral } from '../../../src/compiler/ast-c/expressions.js';
import { CBlock, CDoWhile, CExpressionStatement, CFor, CIf, CVariableDeclaration, CWhile } from '../../../src/compiler/ast-c/statements.js';

describe('CBlock', () => {
  it('stores statements and dispatches to visitBlock', () => {
    const statement = new CExpressionStatement(new CLiteral('0'));
    const node = new CBlock([statement]);
    expect(node.statements).toEqual([statement]);

    const visitor = { visitBlock: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitBlock).toHaveBeenCalledWith(node);
  });
});

describe('CVariableDeclaration', () => {
  it('stores cType/name/initializer and dispatches to visitVariableDeclaration', () => {
    const initializer = new CLiteral('0u');
    const node = new CVariableDeclaration('uint', 'i', initializer);
    expect(node.cType).toBe('uint');
    expect(node.name).toBe('i');
    expect(node.initializer).toBe(initializer);

    const visitor = { visitVariableDeclaration: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitVariableDeclaration).toHaveBeenCalledWith(node);
  });
});

describe('CExpressionStatement', () => {
  it('stores expression and dispatches to visitExpressionStatement', () => {
    const expression = new CLiteral('0');
    const node = new CExpressionStatement(expression);
    expect(node.expression).toBe(expression);

    const visitor = { visitExpressionStatement: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitExpressionStatement).toHaveBeenCalledWith(node);
  });
});

describe('CIf', () => {
  it('stores condition/thenBranch/elseBranch and dispatches to visitIf', () => {
    const condition = new CIdentifier('cond');
    const thenBranch = new CBlock([]);
    const node = new CIf(condition, thenBranch, undefined);
    expect(node.condition).toBe(condition);
    expect(node.thenBranch).toBe(thenBranch);
    expect(node.elseBranch).toBeUndefined();

    const visitor = { visitIf: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitIf).toHaveBeenCalledWith(node);
  });
});

describe('CFor', () => {
  it('stores init/condition/update/body and dispatches to visitFor', () => {
    const init = new CVariableDeclaration('uint', 'i', new CLiteral('0u'));
    const condition = new CIdentifier('cond');
    const update = new CIdentifier('i');
    const body = new CBlock([]);
    const node = new CFor(init, condition, update, body);
    expect(node.init).toBe(init);
    expect(node.condition).toBe(condition);
    expect(node.update).toBe(update);
    expect(node.body).toBe(body);

    const visitor = { visitFor: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitFor).toHaveBeenCalledWith(node);
  });
});

describe('CWhile', () => {
  it('stores condition/body and dispatches to visitWhile', () => {
    const node = new CWhile(new CIdentifier('cond'), new CBlock([]));
    const visitor = { visitWhile: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitWhile).toHaveBeenCalledWith(node);
  });
});

describe('CDoWhile', () => {
  it('stores condition/body and dispatches to visitDoWhile', () => {
    const node = new CDoWhile(new CIdentifier('cond'), new CBlock([]));
    const visitor = { visitDoWhile: vi.fn(() => 'ok') };
    expect(node.accept(visitor as never)).toBe('ok');
    expect(visitor.visitDoWhile).toHaveBeenCalledWith(node);
  });
});
