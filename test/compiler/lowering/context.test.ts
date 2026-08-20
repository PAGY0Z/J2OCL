/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { LoweringAnchors } from '../../../src/compiler/lowering-anchors.js';
import { resolveJ2OCLType } from '../../../src/compiler/lowering/context.js';
import { createTestProgram, type TestProgram } from '../../cli/support/create-test-program.js';

const LIB_SOURCE = `
export declare class UInt32 {
  static of(raw: number): UInt32;
}

export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;
`;

function findFunction(testProgram: TestProgram, name: string) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  return libSourceFile.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)!;
}

describe('resolveJ2OCLType — defensive: anchor class declaration with no name', () => {
  it('skips an unnamed anchor entry rather than crashing, and finds no match', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';
const x: Lib.UInt32 = Lib.UInt32.of(0);
`,
    });
    try {
      const consumerSourceFile = testProgram.getSourceFile('consumer.ts');
      const declaration = consumerSourceFile.statements.find(ts.isVariableStatement)!;
      const declaredType = testProgram.checker.getTypeAtLocation(declaration.declarationList.declarations[0]);

      const unnamedClass = ts.factory.createClassDeclaration(undefined, undefined, undefined, undefined, []);

      const anchors: LoweringAnchors = {
        getGlobalId: findFunction(testProgram, 'getGlobalId'),
        types: new Map([['UInt32', unnamedClass]]),
      };

      const result = resolveJ2OCLType(testProgram.checker, declaredType, anchors);
      expect(result).toBeUndefined();
    } finally {
      testProgram.cleanup();
    }
  });
});
