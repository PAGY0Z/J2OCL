/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { CAssignExpr, CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from '../../src/compiler/ast-c/expressions.js';
import { CBlock, CExpressionStatement, CFor, CIf, CVariableDeclaration, CWhile, CDoWhile } from '../../src/compiler/ast-c/statements.js';
import { CFunction } from '../../src/compiler/ast-c/function.js';
import { CPrinter, printFunction } from '../../src/compiler/print.js';

describe('CPrinter — expressions', () => {
  const printer = new CPrinter();

  it('prints a literal as its text', () => {
    expect(new CLiteral('0u').accept(printer)).toBe('0u');
  });

  it('prints an identifier as its name', () => {
    expect(new CIdentifier('i').accept(printer)).toBe('i');
  });

  it('prints a binary expression as "left op right"', () => {
    expect(new CBinaryExpr('+', new CIdentifier('i'), new CLiteral('1u')).accept(printer)).toBe('(i + 1u)');
  });

  it('prints a unary expression as "op operand"', () => {
    expect(new CUnaryExpr('-', new CIdentifier('i')).accept(printer)).toBe('(-i)');
  });

  it('prints an assignment as "target = value"', () => {
    expect(new CAssignExpr(new CIdentifier('i'), new CLiteral('0u')).accept(printer)).toBe('i = 0u');
  });

  it('prints a call as "callee(args)"', () => {
    expect(new CCall('get_global_id', [new CLiteral('0')]).accept(printer)).toBe('get_global_id(0)');
  });

  it('prints an index expression as "target[index]"', () => {
    expect(new CIndexExpr(new CIdentifier('a'), new CIdentifier('i')).accept(printer)).toBe('a[i]');
  });
});

describe('CPrinter — statements', () => {
  const printer = new CPrinter();

  it('prints a variable declaration', () => {
    const node = new CVariableDeclaration('uint', 'i', new CLiteral('0u'));
    expect(node.accept(printer)).toBe('uint i = 0u;');
  });

  it('prints an expression statement', () => {
    const node = new CExpressionStatement(new CAssignExpr(new CIdentifier('i'), new CLiteral('0u')));
    expect(node.accept(printer)).toBe('i = 0u;');
  });

  it('prints a block with 2-space indentation', () => {
    const block = new CBlock([new CExpressionStatement(new CIdentifier('i'))]);
    expect(block.accept(printer)).toBe('{\n  i;\n}');
  });

  it('leaves a blank line inside a block unindented', () => {
    const blankStatement = {
      accept: () => '',
    } as unknown as CExpressionStatement;
    const block = new CBlock([new CExpressionStatement(new CIdentifier('a')), blankStatement, new CExpressionStatement(new CIdentifier('b'))]);
    expect(block.accept(printer)).toBe('{\n  a;\n\n  b;\n}');
  });

  it('prints an if/else', () => {
    const node = new CIf(new CIdentifier('cond'), new CBlock([new CExpressionStatement(new CIdentifier('a'))]), new CBlock([new CExpressionStatement(new CIdentifier('b'))]));
    expect(node.accept(printer)).toBe('if (cond) {\n  a;\n} else {\n  b;\n}');
  });

  it('prints an if with no else', () => {
    const node = new CIf(new CIdentifier('cond'), new CBlock([]), undefined);
    expect(node.accept(printer)).toBe('if (cond) {\n}');
  });

  it('prints a for loop', () => {
    const node = new CFor(new CVariableDeclaration('uint', 'i', new CLiteral('0u')), new CIdentifier('cond'), new CAssignExpr(new CIdentifier('i'), new CIdentifier('i')), new CBlock([]));
    expect(node.accept(printer)).toBe('for (uint i = 0u; cond; i = i) {\n}');
  });

  it('prints a for loop with omitted clauses', () => {
    const node = new CFor(undefined, undefined, undefined, new CBlock([]));
    expect(node.accept(printer)).toBe('for (;;) {\n}');
  });

  it('prints a while loop', () => {
    const node = new CWhile(new CIdentifier('cond'), new CBlock([]));
    expect(node.accept(printer)).toBe('while (cond) {\n}');
  });

  it('prints a do...while loop', () => {
    const node = new CDoWhile(new CIdentifier('cond'), new CBlock([]));
    expect(node.accept(printer)).toBe('do {\n} while (cond);');
  });
});

describe('printFunction', () => {
  it('prints a kernel signature and body', () => {
    const fn = new CFunction('fill', [{ cType: '__global float*', name: 'out' }], new CBlock([new CExpressionStatement(new CIdentifier('out'))]));
    expect(printFunction(fn, new CPrinter())).toBe('__kernel void fill(__global float* out) {\n  out;\n}');
  });

  it('joins multiple parameters with ", "', () => {
    const fn = new CFunction(
      'add',
      [
        { cType: '__global float*', name: 'a' },
        { cType: 'uint', name: 'n' },
      ],
      new CBlock([]),
    );
    expect(printFunction(fn, new CPrinter())).toBe('__kernel void add(__global float* a, uint n) {\n}');
  });
});
