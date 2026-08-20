/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { Diagnostic } from '../../compiler/diagnostic.js';
import { buildDescriptor } from './build-kernel-descriptor.js';
import type { KernelDescriptor } from '../kernel-types.js';
import { classExtendsKernel } from '../anchors/resolve-kernel-anchors.js';
import { getKernelDecorator } from './kernel-member-checks.js';
import { validateKernelMember } from './validate-kernel-member.js';

export function walkProgramForKernels(program: ts.Program, checker: ts.TypeChecker, kernelClassSymbol: ts.Symbol, kernelDecoratorSymbol: ts.Symbol): { kernels: KernelDescriptor[]; diagnostics: Diagnostic[]; }
{
    const kernels: KernelDescriptor[] = [];
    const diagnostics: Diagnostic[] = [];

    function visitClass(classDeclaration: ts.ClassDeclaration): void
    {
        const extendsKernel = classExtendsKernel(checker, classDeclaration, kernelClassSymbol);
        const sourceFile = classDeclaration.getSourceFile();

        for (const member of classDeclaration.members)
        {
            const decorator = getKernelDecorator(checker, member, kernelDecoratorSymbol);
            if (!decorator) continue;

            const validation = validateKernelMember(member, decorator, extendsKernel);
            if (!validation.valid)
            {
                diagnostics.push(validation.diagnostic);
                continue;
            }

            kernels.push(buildDescriptor(checker, sourceFile, classDeclaration, validation.method));
        }
    }

    function visitNode(node: ts.Node): void
    {
        if (ts.isClassDeclaration(node))
        {
            visitClass(node);
        }
        ts.forEachChild(node, visitNode);
    }

    for (const sourceFile of program.getSourceFiles())
    {
        if (!sourceFile.isDeclarationFile)
        {
            visitNode(sourceFile);
        }
    }

    return { kernels, diagnostics };
}
