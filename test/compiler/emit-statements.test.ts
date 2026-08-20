/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CBlock, CDoWhile, CIf, CWhile } from '../../src/compiler/ast-c/statements.js';
import { IrToCVisitor } from '../../src/compiler/emit.js';
import { IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from '../../src/compiler/ir/expressions.js';
import { IRBlock, IRDoWhile, IRIf, IRInvalid, IRWhile } from '../../src/compiler/ir/statements.js';

describe('IrToCVisitor — statements and error paths', () => {
  const visitor = new IrToCVisitor();

  it('emits IRLiteral(number, Float64) with no suffix', () => {
    const result = new IRLiteral(3.14, 'Float64').accept(visitor);
    expect(result).toMatchObject({ text: '3.14' });
  });

  it('emits IRIf with an else branch as CIf with both branches', () => {
    const node = new IRIf(new IRIdentifier('cond', 'Bool'), new IRBlock([]), new IRBlock([]));
    const result = node.accept(visitor);
    expect(result).toBeInstanceOf(CIf);
    expect((result as CIf).elseBranch).toBeInstanceOf(CBlock);
  });

  it('emits IRIf with no else branch as CIf with elseBranch undefined', () => {
    const node = new IRIf(new IRIdentifier('cond', 'Bool'), new IRBlock([]), undefined);
    const result = node.accept(visitor);
    expect(result).toBeInstanceOf(CIf);
    expect((result as CIf).elseBranch).toBeUndefined();
  });

  it('emits IRWhile as CWhile', () => {
    const node = new IRWhile(new IRIdentifier('cond', 'Bool'), new IRBlock([]));
    expect(node.accept(visitor)).toBeInstanceOf(CWhile);
  });

  it('emits IRDoWhile as CDoWhile', () => {
    const node = new IRDoWhile(new IRIdentifier('cond', 'Bool'), new IRBlock([]));
    expect(node.accept(visitor)).toBeInstanceOf(CDoWhile);
  });

  it('throws when asked to emit an IRInvalid node', () => {
    const node = new IRInvalid({
      file: 'a.ts',
      line: 1,
      column: 1,
      message: 'boom',
    });
    expect(() => node.accept(visitor)).toThrow(/cannot emit an IRInvalid node/);
  });

  it('throws for a method name with no operator mapping and not get/set/length', () => {
    const node = new IRMethodCall(new IRIdentifier('x', 'UInt32'), 'bogus', [], 'UInt32');
    expect(() => node.accept(visitor)).toThrow(/no operator mapping for method "bogus"/);
  });

  it('throws for an intrinsic with no known C mapping', () => {
    const node = new IRIntrinsicCall('bogusIntrinsic', [], 'UInt32');
    expect(() => node.accept(visitor)).toThrow(/no C mapping for intrinsic "bogusIntrinsic"/);
  });
});
