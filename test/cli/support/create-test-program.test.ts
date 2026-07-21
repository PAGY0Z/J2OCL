/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createTestProgram } from './create-test-program.js';

describe('createTestProgram', () => {
  it('builds a program containing the given virtual files, with real parseable content', () => {
    const { program, getSourceFile, cleanup } = createTestProgram({
      'foo.ts': 'export const x = 1;',
    });

    try {
      const sourceFile = getSourceFile('foo.ts');
      expect(sourceFile.text).toContain('export const x = 1;');

      const nonLibFiles = program
        .getSourceFiles()
        .filter(
          (file) =>
            !file.isDeclarationFile && !file.fileName.includes('node_modules'),
        );
      expect(nonLibFiles).toHaveLength(1);
    } finally {
      cleanup();
    }
  });

  it('supports additional real root files alongside virtual ones', () => {
    const realFilePath = fileURLToPath(
      new URL('./create-test-program.ts', import.meta.url),
    );

    const { program, cleanup } = createTestProgram({}, [realFilePath]);

    try {
      expect(program.getSourceFile(realFilePath)).toBeDefined();
    } finally {
      cleanup();
    }
  });

  it('cleanup() removes the temp directory without throwing', () => {
    const { cleanup } = createTestProgram({ 'foo.ts': 'export {};' });

    expect(() => cleanup()).not.toThrow();
  });
});
