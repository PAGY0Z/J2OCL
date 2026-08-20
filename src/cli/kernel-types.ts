/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';

export interface KernelParameter {
  name: string;
  type: ts.Type;
}

export interface KernelDescriptor {
  id: string;
  filePath: string;
  line: number;
  column: number;
  className: string;
  methodName: string;
  body: ts.Block;
  parameters: KernelParameter[];
}

export interface KernelAnchors {
  kernelClass: ts.ClassDeclaration;
  kernelDecorator: ts.FunctionDeclaration;
}
