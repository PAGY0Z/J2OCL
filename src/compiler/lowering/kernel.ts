/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type ts from 'typescript';
import type { KernelDescriptor } from '../../cli/kernel-types.js';
import type { Diagnostic } from '../diagnostic.js';
import type { IRBlock } from '../ir/statements.js';
import type { J2OCLType } from '../j2ocl-type.js';
import type { LoweringAnchors } from '../lowering-anchors.js';
import { resolveJ2OCLType, type LoweringContext } from './context.js';
import { lowerBlock } from './statements.js';

export interface LoweredParameter {
  name: string;
  type: J2OCLType;
}

export interface LoweredKernel {
  name: string;
  parameters: LoweredParameter[];
  body: IRBlock;
}

export interface LowerKernelResult {
  kernel?: LoweredKernel;
  diagnostics: Diagnostic[];
}

export function lowerKernel(descriptor: KernelDescriptor, checker: ts.TypeChecker, anchors: LoweringAnchors): LowerKernelResult {
  const ctx: LoweringContext = {
    checker,
    anchors,
    scope: new Map(),
    diagnostics: [],
  };

  const parameters: LoweredParameter[] = descriptor.parameters.map((parameter) => {
    const type = resolveJ2OCLType(checker, parameter.type, anchors) ?? 'void';
    ctx.scope.set(parameter.name, type);
    return { name: parameter.name, type };
  });

  const body = lowerBlock(descriptor.body, ctx);

  if (ctx.diagnostics.length > 0) {
    return { diagnostics: ctx.diagnostics };
  }
  return {
    kernel: { name: descriptor.methodName, parameters, body },
    diagnostics: [],
  };
}
