/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { resolveToOriginalSymbol } from '../../compiler/ts-symbol-utils.js';

export function hasStaticModifier(method: ts.MethodDeclaration): boolean
{
    const modifiers = ts.getModifiers(method);
    if (!modifiers) return false;
    return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword);
}

export function getKernelDecorator(checker: ts.TypeChecker, member: ts.ClassElement, kernelDecoratorSymbol: ts.Symbol): ts.Decorator | undefined
{
    if (!ts.canHaveDecorators(member)) return undefined;
    const decorators = ts.getDecorators(member);
    if (!decorators) return undefined;

    for (const decorator of decorators)
    {
        const expression = ts.isCallExpression(decorator.expression) ? decorator.expression.expression : decorator.expression;
        const symbol = checker.getSymbolAtLocation(expression);
        if (symbol && resolveToOriginalSymbol(checker, symbol) === kernelDecoratorSymbol)
        {
            return decorator;
        }
    }

    return undefined;
}
