/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { detectKernels } from '../../src/cli/detection/detect-kernels.js';
import { createTestProgram, type TestProgram } from './support/create-test-program.js';

const LIB_SOURCE = `
export abstract class Kernel {}

export function kernel<This extends typeof Kernel, Args extends unknown[]>(
  target: (this: This, ...args: Args) => void,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => void>,
): (this: This, ...args: Args) => void {
  return target;
}
`;

function getAnchors(testProgram: TestProgram) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  const kernelClass = libSourceFile.statements.find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement) && statement.name?.text === 'Kernel');
  const kernelDecorator = libSourceFile.statements.find((statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement) && statement.name?.text === 'kernel');
  if (!kernelClass || !kernelDecorator) {
    throw new Error('test setup: could not find Kernel/kernel in the synthetic library');
  }
  return { kernelClass, kernelDecorator };
}

describe('detectKernels', () => {
  it('detects a single valid kernel declared through a namespace import', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static double(input: number[], out: number[]) {
    out[0] = input[0] * 2;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].className).toBe('Kernels');
      expect(kernels[0].methodName).toBe('double');
      expect(kernels[0].parameters.map((p) => p.name)).toEqual(['input', 'out']);
    } finally {
      testProgram.cleanup();
    }
  });

  it('detects a kernel declared on a multi-level subclass of Kernel', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class BaseKernels extends Lib.Kernel {}

class DerivedKernels extends BaseKernels {
  @Lib.kernel
  static fill(out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].className).toBe('DerivedKernels');
      expect(kernels[0].methodName).toBe('fill');
    } finally {
      testProgram.cleanup();
    }
  });

  it('detects multiple kernels across multiple files', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'a.ts': `
import * as Lib from './lib.js';

class AKernels extends Lib.Kernel {
  @Lib.kernel
  static one(out: number[]) {
    out[0] = 1;
  }
}
`,
      'b.ts': `
import * as Lib from './lib.js';

class BKernels extends Lib.Kernel {
  @Lib.kernel
  static two(out: number[]) {
    out[0] = 2;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(2);
      expect(kernels.map((d) => d.methodName).sort()).toEqual(['one', 'two']);
    } finally {
      testProgram.cleanup();
    }
  });

  it('returns zero results for a Kernel-extending class with no @kernel methods', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class EmptyKernels extends Lib.Kernel {
  static helper() {}
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toEqual([]);
    } finally {
      testProgram.cleanup();
    }
  });

  it('treats a class extending a non-symbol expression as not extending Kernel, reported as a diagnostic', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Foo extends (0 as any) {
  @Lib.kernel
  static bad(out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].message).toMatch(/does not extend Kernel/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('ignores class members that cannot carry decorators (e.g. a static initializer block)', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  static {
  }

  @Lib.kernel
  static double(input: number[], out: number[]) {
    out[0] = input[0] * 2;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].methodName).toBe('double');
    } finally {
      testProgram.cleanup();
    }
  });

  it('matches a @kernel() call-style decorator, not just a bare reference', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel()
  static double(input: number[], out: number[]) {
    out[0] = input[0] * 2;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].methodName).toBe('double');
    } finally {
      testProgram.cleanup();
    }
  });

  it('handles a kernel parameter with a destructuring pattern name', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static fill([first]: number[], out: number[]) {
    out[0] = first;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].parameters.map((p) => p.name)).toEqual(['[first]', 'out']);
    } finally {
      testProgram.cleanup();
    }
  });

  it('ignores an unrelated Kernel/kernel pair that does not resolve to the anchors', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
abstract class Kernel {}
function kernel(target: unknown, _context: unknown) {
  return target;
}

class Foo extends Kernel {
  @kernel
  static bar() {}
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toEqual([]);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic (not a throw) if @kernel decorates a method of a class that does not extend Kernel', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class NotAKernel {
  @Lib.kernel
  static bad() {}
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].message).toMatch(/does not extend Kernel/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('treats a class extending a non-class declaration (e.g. a built-in) as not extending Kernel', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Foo extends Error {
  @Lib.kernel
  static bad(out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].message).toMatch(/does not extend Kernel/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('collects diagnostics for multiple invalid placements in the same program', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'a.ts': `
import * as Lib from './lib.js';

class NotAKernelA {
  @Lib.kernel
  static bad() {}
}
`,
      'b.ts': `
import * as Lib from './lib.js';

class NotAKernelB {
  @Lib.kernel
  static bad() {}
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toHaveLength(2);
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws if @kernel decorates a method of an anonymous class', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

export default class extends Lib.Kernel {
  @Lib.kernel
  static bad(out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      expect(() => detectKernels(testProgram.program, getAnchors(testProgram))).toThrow(/must have a name/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws if @kernel decorates a method with a non-identifier name', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static ['weird'](out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      expect(() => detectKernels(testProgram.program, getAnchors(testProgram))).toThrow(/must have a name/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws if @kernel decorates a method overload signature with no body', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static bad(out: number[]): void;
  static bad(out: number[]) {
    out[0] = 1;
  }
}
`,
    });

    try {
      expect(() => detectKernels(testProgram.program, getAnchors(testProgram))).toThrow(/has no body/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws if the anchor Kernel declaration is unnamed', () => {
    const testProgram = createTestProgram({
      'lib.ts': `
export default abstract class {}

export function kernel(target: unknown, _context: unknown) {
  return target;
}
`,
    });

    try {
      const libSourceFile = testProgram.getSourceFile('lib.ts');
      const kernelClass = libSourceFile.statements.find(ts.isClassDeclaration);
      const kernelDecorator = libSourceFile.statements.find((statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement) && statement.name?.text === 'kernel');
      if (!kernelClass || !kernelDecorator) {
        throw new Error('test setup: could not find declarations');
      }

      expect(() => detectKernels(testProgram.program, { kernelClass, kernelDecorator })).toThrow(/anchor declarations must be named/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('throws if an anchor declaration is a synthetic node that was never bound to the program', () => {
    const testProgram = createTestProgram({ 'lib.ts': LIB_SOURCE });

    try {
      const anchors = getAnchors(testProgram);
      const unboundKernelClass = ts.factory.createClassDeclaration(undefined, ts.factory.createIdentifier('Kernel'), undefined, undefined, []);

      expect(() =>
        detectKernels(testProgram.program, {
          kernelClass: unboundKernelClass,
          kernelDecorator: anchors.kernelDecorator,
        }),
      ).toThrow(/could not resolve anchor declarations to symbols/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic (not a throw) if @kernel decorates a non-static method', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  instanceMethod() {}
}
`,
    });

    try {
      const { kernels, diagnostics } = detectKernels(testProgram.program, getAnchors(testProgram));

      expect(kernels).toEqual([]);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].message).toMatch(/not a static method/);
    } finally {
      testProgram.cleanup();
    }
  });
});

describe('detectKernels — real library smoke test', () => {
  it('detects a kernel that extends the real Kernel class and uses the real kernel decorator', () => {
    const realKernelSourcePath = fileURLToPath(new URL('../../src/decorators/kernel.ts', import.meta.url));
    const dir = mkdtempSync(join(tmpdir(), 'j2ocl-detect-kernels-smoke-'));
    const importSpecifier = relative(dir, realKernelSourcePath).replace(/\.ts$/, '.js').split('\\').join('/');
    const consumerPath = join(dir, 'consumer.ts');

    writeFileSync(
      consumerPath,
      `
import { Kernel, kernel } from '${importSpecifier}';

class Kernels extends Kernel {
  @kernel
  static double(input: number[], out: number[]) {
    out[0] = input[0] * 2;
  }
}
`,
      'utf8',
    );

    try {
      const program = ts.createProgram([consumerPath, realKernelSourcePath], {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true,
        skipLibCheck: true,
      });

      const kernelSourceFile = program.getSourceFile(realKernelSourcePath);
      if (!kernelSourceFile) {
        throw new Error('smoke test setup: could not find the real kernel.ts in the program');
      }
      const kernelClass = kernelSourceFile.statements.find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement) && statement.name?.text === 'Kernel');
      const kernelDecorator = kernelSourceFile.statements.find((statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement) && statement.name?.text === 'kernel');
      if (!kernelClass || !kernelDecorator) {
        throw new Error('smoke test setup: could not find Kernel/kernel declarations');
      }

      const { kernels, diagnostics } = detectKernels(program, {
        kernelClass,
        kernelDecorator,
      });

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].className).toBe('Kernels');
      expect(kernels[0].methodName).toBe('double');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('produces zero TypeScript diagnostics and still finds the kernel when the consumer project uses experimentalDecorators (legacy decorators, e.g. NestJS/Angular/TypeORM-style tsconfig)', () => {
    const realKernelSourcePath = fileURLToPath(new URL('../../src/decorators/kernel.ts', import.meta.url));
    const dir = mkdtempSync(join(tmpdir(), 'j2ocl-detect-kernels-legacy-smoke-'));
    const importSpecifier = relative(dir, realKernelSourcePath).replace(/\.ts$/, '.js').split('\\').join('/');
    const consumerPath = join(dir, 'consumer.ts');

    writeFileSync(
      consumerPath,
      `
import { Kernel, kernel } from '${importSpecifier}';

class Kernels extends Kernel {
  @kernel
  static double(input: number[], out: number[]) {
    out[0] = input[0] * 2;
  }
}
`,
      'utf8',
    );

    try {
      const program = ts.createProgram([consumerPath, realKernelSourcePath], {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true,
        skipLibCheck: true,
        experimentalDecorators: true,
      });

      const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
      expect(preEmitDiagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);

      const kernelSourceFile = program.getSourceFile(realKernelSourcePath);
      if (!kernelSourceFile) {
        throw new Error('smoke test setup: could not find the real kernel.ts in the program');
      }
      const kernelClass = kernelSourceFile.statements.find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement) && statement.name?.text === 'Kernel');
      const kernelDecorator = kernelSourceFile.statements.find((statement): statement is ts.FunctionDeclaration => ts.isFunctionDeclaration(statement) && statement.name?.text === 'kernel');
      if (!kernelClass || !kernelDecorator) {
        throw new Error('smoke test setup: could not find Kernel/kernel declarations');
      }

      const { kernels, diagnostics } = detectKernels(program, {
        kernelClass,
        kernelDecorator,
      });

      expect(diagnostics).toEqual([]);
      expect(kernels).toHaveLength(1);
      expect(kernels[0].className).toBe('Kernels');
      expect(kernels[0].methodName).toBe('double');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
