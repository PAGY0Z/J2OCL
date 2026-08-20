/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { CAssignExpr, CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from './expressions.js';
import type { CBlock, CDoWhile, CExpressionStatement, CFor, CIf, CVariableDeclaration, CWhile } from './statements.js';

export interface CVisitor<T> {
  visitLiteral(node: CLiteral): T;
  visitIdentifier(node: CIdentifier): T;
  visitBinaryExpr(node: CBinaryExpr): T;
  visitUnaryExpr(node: CUnaryExpr): T;
  visitAssignExpr(node: CAssignExpr): T;
  visitCall(node: CCall): T;
  visitIndexExpr(node: CIndexExpr): T;
  visitBlock(node: CBlock): T;
  visitVariableDeclaration(node: CVariableDeclaration): T;
  visitExpressionStatement(node: CExpressionStatement): T;
  visitIf(node: CIf): T;
  visitFor(node: CFor): T;
  visitWhile(node: CWhile): T;
  visitDoWhile(node: CDoWhile): T;
}
