/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type ts from 'typescript';
import type { KernelDescriptor } from '../cli/kernel-types.js';
import type { Diagnostic } from './diagnostic.js';
import { emitKernel, IrToCVisitor } from './emit.js';
import type { LoweringAnchors } from './lowering-anchors.js';
import { lowerKernel } from './lowering/kernel.js';
import { CPrinter, printFunction } from './print.js';

export type CompileResult = { ok: true; code: string; } | { ok: false; diagnostics: Diagnostic[]; };

export function compileKernel(descriptor: KernelDescriptor, checker: ts.TypeChecker, anchors: LoweringAnchors): CompileResult
{
    const { kernel, diagnostics } = lowerKernel(descriptor, checker, anchors);
    if (!kernel)
    {
        return { ok: false, diagnostics };
    }

    const cFunction = emitKernel(kernel, new IrToCVisitor());
    const code = printFunction(cFunction, new CPrinter());
    return { ok: true, code };
}
