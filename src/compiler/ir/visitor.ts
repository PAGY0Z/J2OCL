/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { IRAssignExpr, IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from './expressions.js';
import type { IRBlock, IRDoWhile, IRExpressionStatement, IRFor, IRIf, IRInvalid, IRVariableDeclaration, IRWhile } from './statements.js';

export interface IRVisitor<T> {
  visitLiteral(node: IRLiteral): T;
  visitIdentifier(node: IRIdentifier): T;
  visitMethodCall(node: IRMethodCall): T;
  visitIntrinsicCall(node: IRIntrinsicCall): T;
  visitAssignExpr(node: IRAssignExpr): T;
  visitBlock(node: IRBlock): T;
  visitVariableDeclaration(node: IRVariableDeclaration): T;
  visitExpressionStatement(node: IRExpressionStatement): T;
  visitIf(node: IRIf): T;
  visitFor(node: IRFor): T;
  visitWhile(node: IRWhile): T;
  visitDoWhile(node: IRDoWhile): T;
  visitInvalid(node: IRInvalid): T;
}
