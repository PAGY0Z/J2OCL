/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { KernelDescriptor, KernelParameter } from '../kernel-types.js';

export function buildDescriptor(checker: ts.TypeChecker, sourceFile: ts.SourceFile, classDeclaration: ts.ClassDeclaration, method: ts.MethodDeclaration): KernelDescriptor {
  const className = classDeclaration.name?.text;
  const methodName = ts.isIdentifier(method.name) ? method.name.text : undefined;
  if (!className || !methodName) {
    throw new Error('detectKernels: kernel classes and methods must have a name');
  }
  if (!method.body) {
    throw new Error(`detectKernels: @kernel method ${className}.${methodName} has no body`);
  }

  const { line, character } = sourceFile.getLineAndCharacterOfPosition(method.getStart());
  const parameters: KernelParameter[] = method.parameters.map((parameter) => ({
    name: ts.isIdentifier(parameter.name) ? parameter.name.text : parameter.name.getText(),
    type: checker.getTypeAtLocation(parameter),
  }));

  return {
    id: `${sourceFile.fileName}#${className}.${methodName}`,
    filePath: sourceFile.fileName,
    line: line + 1,
    column: character + 1,
    className,
    methodName,
    body: method.body,
    parameters,
  };
}
