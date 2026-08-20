/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';

export function resolveToOriginalSymbol(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  let resolved = symbol;
  while ((resolved.flags & ts.SymbolFlags.Alias) !== 0) {
    resolved = checker.getAliasedSymbol(resolved);
  }
  return resolved;
}
