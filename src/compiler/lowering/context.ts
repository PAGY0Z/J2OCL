/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { Diagnostic } from '../diagnostic.js';
import type { J2OCLType } from '../j2ocl-type.js';
import type { LoweringAnchors } from '../lowering-anchors.js';
import { resolveToOriginalSymbol } from '../ts-symbol-utils.js';

export interface LoweringContext {
  checker: ts.TypeChecker;
  anchors: LoweringAnchors;
  scope: Map<string, J2OCLType>;
  diagnostics: Diagnostic[];
}

export function diagnosticAt(node: ts.Node, message: string): Diagnostic {
  const sourceFile = node.getSourceFile();
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return {
    file: sourceFile.fileName,
    line: line + 1,
    column: character + 1,
    message,
  };
}

export function findTypeNameForSymbol(checker: ts.TypeChecker, anchors: LoweringAnchors, targetSymbol: ts.Symbol): J2OCLType | undefined {
  for (const [typeName, classDeclaration] of anchors.types) {
    const nameNode = classDeclaration.name;
    if (!nameNode) continue;
    const anchorSymbol = checker.getSymbolAtLocation(nameNode);
    if (anchorSymbol && resolveToOriginalSymbol(checker, anchorSymbol) === targetSymbol) {
      return typeName;
    }
  }
  return undefined;
}

export function resolveJ2OCLType(checker: ts.TypeChecker, type: ts.Type, anchors: LoweringAnchors): J2OCLType | undefined {
  const symbol = type.getSymbol();
  if (!symbol) return undefined;
  const resolved = resolveToOriginalSymbol(checker, symbol);
  return findTypeNameForSymbol(checker, anchors, resolved);
}
