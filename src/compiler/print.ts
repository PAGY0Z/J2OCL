/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { CAssignExpr, CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from './ast-c/expressions.js';
import type { CFunction } from './ast-c/function.js';
import type { CNode } from './ast-c/node.js';
import type { CBlock, CDoWhile, CExpressionStatement, CFor, CIf, CVariableDeclaration, CWhile } from './ast-c/statements.js';
import type { CVisitor } from './ast-c/visitor.js';

const INDENT = '  ';

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? `${INDENT}${line}` : line))
    .join('\n');
}

export class CPrinter implements CVisitor<string> {
  visitLiteral(node: CLiteral): string {
    return node.text;
  }

  visitIdentifier(node: CIdentifier): string {
    return node.name;
  }

  visitBinaryExpr(node: CBinaryExpr): string {
    return `(${node.left.accept(this)} ${node.operator} ${node.right.accept(this)})`;
  }

  visitUnaryExpr(node: CUnaryExpr): string {
    return `(${node.operator}${node.operand.accept(this)})`;
  }

  visitAssignExpr(node: CAssignExpr): string {
    return `${node.target.accept(this)} = ${node.value.accept(this)}`;
  }

  visitCall(node: CCall): string {
    return `${node.callee}(${node.args.map((arg) => arg.accept(this)).join(', ')})`;
  }

  visitIndexExpr(node: CIndexExpr): string {
    return `${node.target.accept(this)}[${node.index.accept(this)}]`;
  }

  visitBlock(node: CBlock): string {
    if (node.statements.length === 0) return '{\n}';
    const body = node.statements.map((statement) => statement.accept(this)).join('\n');
    return `{\n${indent(body)}\n}`;
  }

  visitVariableDeclaration(node: CVariableDeclaration): string {
    return `${node.cType} ${node.name} = ${node.initializer.accept(this)};`;
  }

  visitExpressionStatement(node: CExpressionStatement): string {
    return `${node.expression.accept(this)};`;
  }

  visitIf(node: CIf): string {
    const thenText = `if (${node.condition.accept(this)}) ${node.thenBranch.accept(this)}`;
    if (!node.elseBranch) return thenText;
    return `${thenText} else ${node.elseBranch.accept(this)}`;
  }

  visitFor(node: CFor): string {
    const init = node.init ? this.printClauseWithoutSemicolon(node.init) : '';
    const condition = node.condition ? ` ${node.condition.accept(this)}` : '';
    const update = node.update ? ` ${this.printClauseWithoutSemicolon(node.update)}` : '';
    return `for (${init};${condition};${update}) ${node.body.accept(this)}`;
  }

  private printClauseWithoutSemicolon(node: CNode): string {
    if ('cType' in node) {
      const declaration = node as CVariableDeclaration;
      return `${declaration.cType} ${declaration.name} = ${declaration.initializer.accept(this)}`;
    }
    return node.accept(this);
  }

  visitWhile(node: CWhile): string {
    return `while (${node.condition.accept(this)}) ${node.body.accept(this)}`;
  }

  visitDoWhile(node: CDoWhile): string {
    return `do ${node.body.accept(this)} while (${node.condition.accept(this)});`;
  }
}

export function printFunction(fn: CFunction, printer: CPrinter): string {
  const params = fn.parameters.map((p) => `${p.cType} ${p.name}`).join(', ');
  return `__kernel void ${fn.name}(${params}) ${fn.body.accept(printer)}`;
}
