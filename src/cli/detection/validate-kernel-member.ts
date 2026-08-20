/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { Diagnostic } from '../../compiler/diagnostic.js';
import { hasStaticModifier } from './kernel-member-checks.js';

export type MemberValidation = { valid: true; method: ts.MethodDeclaration } | { valid: false; diagnostic: Diagnostic };

export function validateKernelMember(member: ts.ClassElement, decorator: ts.Decorator, extendsKernel: boolean): MemberValidation {
  const sourceFile = member.getSourceFile();
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(decorator.getStart());
  const location = {
    file: sourceFile.fileName,
    line: line + 1,
    column: character + 1,
  };

  if (!extendsKernel) {
    return {
      valid: false,
      diagnostic: {
        ...location,
        message: 'invalid @kernel usage, its class does not extend Kernel',
      },
    };
  }
  if (!ts.isMethodDeclaration(member) || !hasStaticModifier(member)) {
    return {
      valid: false,
      diagnostic: {
        ...location,
        message: 'invalid @kernel usage, it is not a static method',
      },
    };
  }
  return { valid: true, method: member };
}
