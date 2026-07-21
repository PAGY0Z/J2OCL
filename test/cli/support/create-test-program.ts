/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';

export interface TestProgram {
  program: ts.Program;
  checker: ts.TypeChecker;
  getSourceFile: (fileName: string) => ts.SourceFile;
  cleanup: () => void;
}

// Real files on disk, not a hand-rolled virtual host, so lib.d.ts and module
// resolution behave exactly like they would for a real project.
export function createTestProgram(
  files: Record<string, string>,
  additionalRootFiles: string[] = [],
): TestProgram {
  const dir = mkdtempSync(join(tmpdir(), 'j2ocl-detect-kernels-'));
  const rootNames = [...additionalRootFiles];

  for (const [name, content] of Object.entries(files)) {
    const filePath = join(dir, name);
    writeFileSync(filePath, content, 'utf8');
    rootNames.push(filePath);
  }

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: true,
  };

  const program = ts.createProgram(rootNames, compilerOptions);
  const checker = program.getTypeChecker();

  return {
    program,
    checker,
    getSourceFile(fileName: string): ts.SourceFile {
      const filePath = join(dir, fileName);
      const sourceFile = program.getSourceFile(filePath);
      if (!sourceFile) {
        throw new Error(
          `createTestProgram: no source file found for "${fileName}"`,
        );
      }
      return sourceFile;
    },
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
