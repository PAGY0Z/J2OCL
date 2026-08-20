/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { resolveToOriginalSymbol } from '../../compiler/ts-symbol-utils.js';
import type { LoweringAnchors } from '../../compiler/lowering-anchors.js';
import type { J2OCLType } from '../../compiler/j2ocl-type.js';
import type { KernelAnchors } from '../kernel-types.js';

const TYPE_NAMES: readonly J2OCLType[] = ['Int8', 'UInt8', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Int64', 'UInt64', 'Float32', 'Float64', 'Bool', 'CharArray', 'UCharArray', 'ShortArray', 'UShortArray', 'IntArray', 'UIntArray', 'LongArray', 'ULongArray', 'FloatArray', 'DoubleArray'];

function declarationsByImportedName(program: ts.Program, anchorSourceFile: ts.SourceFile): Map<string, ts.Declaration> {
  const checker = program.getTypeChecker();
  const result = new Map<string, ts.Declaration>();

  for (const statement of anchorSourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      const symbol = checker.getSymbolAtLocation(element.name);
      if (!symbol) {
        throw new Error(`resolvePackageAnchors: could not resolve imported name "${element.name.text}"`);
      }
      const resolved = resolveToOriginalSymbol(checker, symbol);
      const declaration = resolved.declarations?.[0];
      if (!declaration) {
        throw new Error(`resolvePackageAnchors: "${element.name.text}" has no declaration`);
      }
      result.set(element.name.text, declaration);
    }
  }

  return result;
}

export function resolvePackageAnchors(program: ts.Program, anchorSourceFile: ts.SourceFile): { kernelAnchors: KernelAnchors; loweringAnchors: LoweringAnchors } {
  const declarations = declarationsByImportedName(program, anchorSourceFile);

  function getClass(name: string): ts.ClassDeclaration {
    const declaration = declarations.get(name);
    if (!declaration || !ts.isClassDeclaration(declaration)) {
      throw new Error(`resolvePackageAnchors: "${name}" did not resolve to a class declaration`);
    }
    return declaration;
  }

  function getFunction(name: string): ts.FunctionDeclaration {
    const declaration = declarations.get(name);
    if (!declaration || !ts.isFunctionDeclaration(declaration)) {
      throw new Error(`resolvePackageAnchors: "${name}" did not resolve to a function declaration`);
    }
    return declaration;
  }

  const types = new Map<J2OCLType, ts.ClassDeclaration>();
  for (const name of TYPE_NAMES) {
    types.set(name, getClass(name));
  }

  return {
    kernelAnchors: {
      kernelClass: getClass('Kernel'),
      kernelDecorator: getFunction('kernel'),
    },
    loweringAnchors: {
      getGlobalId: getFunction('getGlobalId'),
      types,
    },
  };
}
