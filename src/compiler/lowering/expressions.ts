/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from '../ir/expressions.js';
import { IRInvalid } from '../ir/statements.js';
import type { IRNode } from '../ir/node.js';
import type { J2OCLType } from '../j2ocl-type.js';
import { lookupOperator } from '../operator-mapping.js';
import { resolveToOriginalSymbol } from '../ts-symbol-utils.js';
import { diagnosticAt, findTypeNameForSymbol, resolveJ2OCLType, type LoweringContext } from './context.js';

export function lowerExpression(node: ts.Expression, ctx: LoweringContext): IRNode
{
    if (ts.isNumericLiteral(node) || node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword)
    {
        const diagnostic = diagnosticAt(node, `literal "${node.getText()}" must be wrapped via a scalar type's .of()`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }
    if (ts.isIdentifier(node))
    {
        const type = ctx.scope.get(node.text);
        if (type === undefined)
        {
            const diagnostic = diagnosticAt(node, `unresolved identifier "${node.text}"`);
            ctx.diagnostics.push(diagnostic);
            return new IRInvalid(diagnostic);
        }
        return new IRIdentifier(node.text, type);
    }
    if (ts.isCallExpression(node))
    {
        return lowerCall(node, ctx);
    }
    if (ts.isPropertyAccessExpression(node))
    {
        const receiverType = ctx.checker.getTypeAtLocation(node.expression);
        const receiverTypeName = resolveJ2OCLType(ctx.checker, receiverType, ctx.anchors);
        if (receiverTypeName === undefined)
        {
            const diagnostic = diagnosticAt(node, `cannot translate expression "${node.getText()}" — receiver is not a recognized J2OCL type`);
            ctx.diagnostics.push(diagnostic);
            return new IRInvalid(diagnostic);
        }
        if (node.name.text === 'length')
        {
            const diagnostic = diagnosticAt(node, '".length" cannot be used inside a compiled kernel — once compiled, a buffer is a ' + 'bare pointer with no length information; pass the length as an explicit scalar ' + 'parameter instead');
            ctx.diagnostics.push(diagnostic);
            return new IRInvalid(diagnostic);
        }
        const receiver = lowerExpression(node.expression, ctx);
        const resultType = resolveJ2OCLType(ctx.checker, ctx.checker.getTypeAtLocation(node), ctx.anchors) ?? 'void';
        return new IRMethodCall(receiver, node.name.text, [], resultType);
    }
    if (ts.isParenthesizedExpression(node))
    {
        return lowerExpression(node.expression, ctx);
    }
    if (ts.isAsExpression(node))
    {
        return lowerExpression(node.expression, ctx);
    }

    const diagnostic = diagnosticAt(node, `cannot translate expression "${node.getText()}"`);
    ctx.diagnostics.push(diagnostic);
    return new IRInvalid(diagnostic);
}

export function lowerIntrinsicArgument(node: ts.Expression, ctx: LoweringContext): IRNode
{
    if (ts.isNumericLiteral(node))
    {
        return new IRLiteral(Number(node.text), 'UInt32');
    }
    const diagnostic = diagnosticAt(node, `intrinsic argument "${node.getText()}" must be a numeric literal`);
    ctx.diagnostics.push(diagnostic);
    return new IRInvalid(diagnostic);
}

export function lowerCall(node: ts.CallExpression, ctx: LoweringContext): IRNode
{
    const callee = node.expression;

    const calleeSymbol = ctx.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(callee) ? callee.name : callee);
    if (calleeSymbol)
    {
        const resolvedCallee = resolveToOriginalSymbol(ctx.checker, calleeSymbol);
        const getGlobalIdName = ctx.anchors.getGlobalId.name;
        if (getGlobalIdName)
        {
            const anchorSymbol = ctx.checker.getSymbolAtLocation(getGlobalIdName);
            if (anchorSymbol && resolveToOriginalSymbol(ctx.checker, anchorSymbol) === resolvedCallee)
            {
                const args = node.arguments.map((arg) => lowerIntrinsicArgument(arg, ctx));
                return new IRIntrinsicCall('getGlobalId', args, 'UInt32');
            }
        }
    }

    if (!ts.isPropertyAccessExpression(callee))
    {
        const diagnostic = diagnosticAt(node, `cannot translate call "${node.getText()}"`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }

    const methodName = callee.name.text;
    const receiverExpression = callee.expression;
    const receiverType = ctx.checker.getTypeAtLocation(receiverExpression);
    const receiverTypeName = resolveJ2OCLType(ctx.checker, receiverType, ctx.anchors);

    if (methodName === 'of')
    {
        const classReferenceNode = ts.isPropertyAccessExpression(receiverExpression) ? receiverExpression.name : receiverExpression;
        const classSymbol = ctx.checker.getSymbolAtLocation(classReferenceNode);
        if (classSymbol)
        {
            const resolvedClassSymbol = resolveToOriginalSymbol(ctx.checker, classSymbol);
            const typeName = findTypeNameForSymbol(ctx.checker, ctx.anchors, resolvedClassSymbol);
            if (typeName)
            {
                return lowerOfLiteral(node, typeName, ctx);
            }
        }
    }

    if (receiverTypeName === undefined)
    {
        const diagnostic = diagnosticAt(node, `cannot translate call "${node.getText()}" — receiver is not a recognized J2OCL type`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }
    const operator = lookupOperator(methodName);
    if (methodName !== 'get' && methodName !== 'set' && !operator)
    {
        const diagnostic = diagnosticAt(node, `cannot translate call "${node.getText()}" — "${methodName}" is not a supported J2OCL operation`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }

    const expectedArgCount = methodName === 'get' ? 1 : methodName === 'set' ? 2 : operator!.kind === 'unary-prefix' ? 0 : 1;
    if (node.arguments.length !== expectedArgCount)
    {
        const diagnostic = diagnosticAt(node, `cannot translate call "${node.getText()}" — "${methodName}" expects ${expectedArgCount} argument(s), got ${node.arguments.length}`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }

    const receiver = lowerExpression(receiverExpression, ctx);
    const args = node.arguments.map((arg) => lowerExpression(arg, ctx));
    const resultType = resolveJ2OCLType(ctx.checker, ctx.checker.getTypeAtLocation(node), ctx.anchors) ?? 'void';
    return new IRMethodCall(receiver, methodName, args, resultType);
}

export function lowerOfLiteral(node: ts.CallExpression, type: J2OCLType, ctx: LoweringContext): IRNode
{
    const [argument] = node.arguments;
    if (!argument)
    {
        const diagnostic = diagnosticAt(node, `.of() requires exactly one literal argument`);
        ctx.diagnostics.push(diagnostic);
        return new IRInvalid(diagnostic);
    }

    let unwrapped = argument;
    let negative = false;
    if (ts.isPrefixUnaryExpression(unwrapped) && unwrapped.operator === ts.SyntaxKind.MinusToken)
    {
        negative = true;
        unwrapped = unwrapped.operand;
    }

    if (ts.isNumericLiteral(unwrapped))
    {
        const value = Number(unwrapped.text) * (negative ? -1 : 1);
        return new IRLiteral(value, type);
    }
    if (unwrapped.kind === ts.SyntaxKind.TrueKeyword || unwrapped.kind === ts.SyntaxKind.FalseKeyword)
    {
        return new IRLiteral(unwrapped.kind === ts.SyntaxKind.TrueKeyword, type);
    }

    const diagnostic = diagnosticAt(argument, `.of() argument must be a literal, got "${argument.getText()}"`);
    ctx.diagnostics.push(diagnostic);
    return new IRInvalid(diagnostic);
}
