/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { IRAssignExpr, IRIdentifier } from '../ir/expressions.js';
import { IRBlock, IRDoWhile, IRExpressionStatement as IRExpressionStatementNode, IRFor, IRIf, IRInvalid, IRVariableDeclaration as IRVariableDeclarationNode, IRWhile } from '../ir/statements.js';
import type { IRNode } from '../ir/node.js';
import type { J2OCLType } from '../j2ocl-type.js';
import { diagnosticAt, resolveJ2OCLType, type LoweringContext } from './context.js';
import { lowerExpression } from './expressions.js';

export function lowerVariableStatement(node: ts.VariableStatement, ctx: LoweringContext): IRNode
{
    const declaration = node.declarationList.declarations[0];
    const name = ts.isIdentifier(declaration.name) ? declaration.name.text : declaration.name.getText();
    const initializer = declaration.initializer ? lowerExpression(declaration.initializer, ctx) : undefined;
    if (!initializer)
    {
        const diagnostic = diagnosticAt(declaration, 'variable declaration requires an initializer');
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }

    const type = resolveJ2OCLType(ctx.checker, ctx.checker.getTypeAtLocation(declaration), ctx.anchors) ?? ('type' in initializer ? (initializer as { type: J2OCLType; }).type : 'void');
    ctx.scope.set(name, type);

    return new IRVariableDeclarationNode(name, type, initializer);
}

export function lowerStatement(node: ts.Statement, ctx: LoweringContext): IRNode
{
    if (ts.isVariableStatement(node))
    {
        return lowerVariableStatement(node, ctx);
    }
    if (ts.isExpressionStatement(node))
    {
        return new IRExpressionStatementNode(lowerExpressionStatementBody(node.expression, ctx));
    }
    if (ts.isIfStatement(node))
    {
        const condition = lowerExpression(node.expression, ctx);
        const thenBranch = lowerBlock(node.thenStatement, ctx);
        const elseBranch = node.elseStatement ? lowerBlock(node.elseStatement, ctx) : undefined;
        return new IRIf(condition, thenBranch, elseBranch);
    }
    if (ts.isForStatement(node))
    {
        const init = node.initializer ? (ts.isVariableDeclarationList(node.initializer) ? lowerVariableStatement(ts.factory.createVariableStatement(undefined, node.initializer), ctx) : lowerExpressionStatementBody(node.initializer, ctx)) : undefined;
        const condition = node.condition ? lowerExpression(node.condition, ctx) : undefined;
        const update = node.incrementor ? lowerExpressionStatementBody(node.incrementor, ctx) : undefined;
        const body = lowerBlock(node.statement, ctx);
        return new IRFor(init, condition, update, body);
    }
    if (ts.isWhileStatement(node))
    {
        return new IRWhile(lowerExpression(node.expression, ctx), lowerBlock(node.statement, ctx));
    }
    if (ts.isDoStatement(node))
    {
        return new IRDoWhile(lowerExpression(node.expression, ctx), lowerBlock(node.statement, ctx));
    }
    if (ts.isForOfStatement(node) || ts.isForInStatement(node))
    {
        const diagnostic = diagnosticAt(node, 'for...of/for...in are not supported, no iterators in OpenCL C');
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }
    if (ts.isBlock(node))
    {
        return lowerBlock(node, ctx);
    }

    const diagnostic = diagnosticAt(node, `cannot translate statement "${node.getText()}"`);
    ctx.diagnostics.push(diagnostic);
    return new IRInvalid(diagnostic);
}

export function lowerExpressionStatementBody(expression: ts.Expression, ctx: LoweringContext): IRNode
{
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.EqualsToken)
    {
        const target = lowerExpression(expression.left, ctx);
        const value = lowerExpression(expression.right, ctx);
        if (!(target instanceof IRIdentifier))
        {
            const diagnostic = diagnosticAt(expression.left, 'assignment target must be a local variable');
            ctx.diagnostics.push(diagnostic);
            return new IRInvalid(diagnostic);
        }
        return new IRAssignExpr(target, value, target.type);
    }
    return lowerExpression(expression, ctx);
}

export function lowerBlock(node: ts.Statement, ctx: LoweringContext): IRBlock
{
    const statements = ts.isBlock(node) ? node.statements : [node];
    return new IRBlock(statements.map((statement) => lowerStatement(statement, ctx)));
}
