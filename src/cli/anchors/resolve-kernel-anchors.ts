/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { resolveToOriginalSymbol } from '../../compiler/ts-symbol-utils.js';
import type { KernelAnchors } from '../kernel-types.js';

export function resolveAnchorSymbols(checker: ts.TypeChecker, anchors: KernelAnchors): { kernelClassSymbol: ts.Symbol; kernelDecoratorSymbol: ts.Symbol; }
{
    const kernelClassNameNode = anchors.kernelClass.name;
    const kernelDecoratorNameNode = anchors.kernelDecorator.name;
    if (!kernelClassNameNode || !kernelDecoratorNameNode)
    {
        throw new Error('detectKernels: anchor declarations must be named');
    }

    const kernelClassSymbol = checker.getSymbolAtLocation(kernelClassNameNode);
    const kernelDecoratorSymbol = checker.getSymbolAtLocation(kernelDecoratorNameNode);
    if (!kernelClassSymbol || !kernelDecoratorSymbol)
    {
        throw new Error('detectKernels: could not resolve anchor declarations to symbols');
    }

    return {
        kernelClassSymbol: resolveToOriginalSymbol(checker, kernelClassSymbol),
        kernelDecoratorSymbol: resolveToOriginalSymbol(checker, kernelDecoratorSymbol),
    };
}

export function classExtendsKernel(checker: ts.TypeChecker, classDeclaration: ts.ClassDeclaration, kernelClassSymbol: ts.Symbol): boolean
{
    let currentClass: ts.ClassDeclaration | undefined = classDeclaration;

    while (currentClass)
    {
        const extendsClause = currentClass.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword);
        const parentExpression = extendsClause?.types[0]?.expression;
        if (!parentExpression) return false;

        const parentSymbol = checker.getSymbolAtLocation(parentExpression);
        if (!parentSymbol) return false;

        const resolvedParentSymbol = resolveToOriginalSymbol(checker, parentSymbol);
        if (resolvedParentSymbol === kernelClassSymbol) return true;

        currentClass = resolvedParentSymbol.declarations?.find(ts.isClassDeclaration);
    }

    return false;
}
