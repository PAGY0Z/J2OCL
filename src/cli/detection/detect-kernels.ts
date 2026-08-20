/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { Diagnostic } from '../../compiler/diagnostic.js';
import type { KernelAnchors, KernelDescriptor } from '../kernel-types.js';
import { resolveAnchorSymbols } from '../anchors/resolve-kernel-anchors.js';
import { walkProgramForKernels } from './walk-program-for-kernels.js';

export * from '../kernel-types.js';

export function detectKernels(program: ts.Program, anchors: KernelAnchors): { kernels: KernelDescriptor[]; diagnostics: Diagnostic[]; }
{
    const checker = program.getTypeChecker();
    const { kernelClassSymbol, kernelDecoratorSymbol } = resolveAnchorSymbols(checker, anchors);
    return walkProgramForKernels(program, checker, kernelClassSymbol, kernelDecoratorSymbol);
}
