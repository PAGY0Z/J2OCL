/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { detectKernels } from '../../../src/cli/detection/detect-kernels.js';
import { IRAssignExpr } from '../../../src/compiler/ir/expressions.js';
import { IRBlock, IRDoWhile, IRFor, IRIf, IRVariableDeclaration, IRWhile } from '../../../src/compiler/ir/statements.js';
import type { LoweringAnchors } from '../../../src/compiler/lowering-anchors.js';
import { lowerKernel } from '../../../src/compiler/lowering/kernel.js';
import { createTestProgram, type TestProgram } from '../../cli/support/create-test-program.js';

const LIB_SOURCE = `
export abstract class Kernel {}

export function kernel<This extends typeof Kernel, Args extends unknown[]>(
  target: (this: This, ...args: Args) => void,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => void>,
): (this: This, ...args: Args) => void {
  return target;
}

export declare class UInt32 {
  static of(raw: number): UInt32;
  add(other: UInt32): UInt32;
  lessThan(other: UInt32): Bool;
  negate(): UInt32;
}

export declare class Bool {
  static of(raw: boolean): Bool;
}

export declare class FloatArray {
  get(index: UInt32): Float32;
  set(index: UInt32, value: Float32): void;
  readonly length: UInt32;
  readonly capacity: number;
}

export declare class Float32 {
  add(other: Float32): Float32;
}

export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;

export declare class NotAJ2OCLType {
  static of(raw: number): NotAJ2OCLType;
}

export declare function bareFn(): void;
`;

function getAnchors(testProgram: TestProgram) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  const findClass = (name: string) => libSourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === name)!;
  const findFunction = (name: string) => libSourceFile.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)!;

  const kernelClass = findClass('Kernel');
  const kernelDecorator = findFunction('kernel');
  const loweringAnchors: LoweringAnchors = {
    getGlobalId: findFunction('getGlobalId'),
    types: new Map([
      ['UInt32', findClass('UInt32')],
      ['Bool', findClass('Bool')],
      ['FloatArray', findClass('FloatArray')],
      ['Float32', findClass('Float32')],
    ]),
  };
  return { kernelClass, kernelDecorator, loweringAnchors };
}

function lowerSource(testProgram: TestProgram, anchors: ReturnType<typeof getAnchors>) {
  const { kernels } = detectKernels(testProgram.program, anchors);
  return lowerKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);
}

describe('lowerKernel — statements and control flow', () => {
  it('lowers if/else to IRIf', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    if (n.lessThan(n)) {
      const i: Lib.UInt32 = n;
    } else {
      const j: Lib.UInt32 = n;
    }
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const node = kernel!.body.statements[0];
      expect(node).toBeInstanceOf(IRIf);
      const ifNode = node as IRIf;
      expect(ifNode.thenBranch.statements).toHaveLength(1);
      expect(ifNode.elseBranch?.statements).toHaveLength(1);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a for loop (matching the reference vectorAdd kernel shape) to IRFor', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(a: Lib.FloatArray, b: Lib.FloatArray, out: Lib.FloatArray, length: Lib.UInt32) {
    for (let i: Lib.UInt32 = Lib.UInt32.of(0); i.lessThan(length); i = i.add(Lib.UInt32.of(1))) {
      out.set(i, a.get(i).add(b.get(i)));
    }
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const forNode = kernel!.body.statements[0];
      expect(forNode).toBeInstanceOf(IRFor);
      const node = forNode as IRFor;
      expect(node.init).toBeDefined();
      expect(node.condition).toBeDefined();
      expect(node.update).toBeDefined();
      expect(node.body.statements).toHaveLength(1);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers while and do...while to IRWhile / IRDoWhile', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    while (n.lessThan(n)) {}
    do {} while (n.lessThan(n));
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      expect(kernel!.body.statements[0]).toBeInstanceOf(IRWhile);
      expect(kernel!.body.statements[1]).toBeInstanceOf(IRDoWhile);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic for for...of instead of throwing, and keeps collecting later errors', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, xs: Lib.UInt32[]) {
    for (const x of xs) {}
    const bad: Lib.UInt32 = undefinedIdentifier as unknown as Lib.UInt32;
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics.length).toBeGreaterThanOrEqual(2);
      expect(diagnostics.some((d) => /for...of/.test(d.message))).toBe(true);
      expect(diagnostics.some((d) => /undefinedIdentifier/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });
});

describe('lowerKernel — statement diagnostics', () => {
  it('rejects a variable declaration with no initializer', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    let i: Lib.UInt32;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /variable declaration requires an initializer/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('falls back to the source text for a destructuring variable name', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const [a] = out;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel } = lowerSource(testProgram, anchors);
      const declaration = kernel!.body.statements[0] as unknown as IRVariableDeclaration;
      expect(declaration.name).toBe('[a]');
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a standalone nested block statement', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    {
      const i: Lib.UInt32 = Lib.UInt32.of(0);
    }
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      expect(kernel!.body.statements[0]).toBeInstanceOf(IRBlock);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a for-loop init that reassigns an existing variable instead of declaring one', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    let i: Lib.UInt32 = Lib.UInt32.of(0);
    for (i = Lib.UInt32.of(0); i.lessThan(n); i = i.add(Lib.UInt32.of(1))) {}
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const forNode = kernel!.body.statements[1] as unknown as IRFor;
      expect(forNode.init).toBeInstanceOf(IRAssignExpr);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for a for-loop init with no initializer', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(n: Lib.UInt32) {
    for (let i; i.lessThan(n); ) {}
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0].message).toMatch(/requires an initializer/);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects an assignment whose target is not a local variable', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, v: Lib.Float32) {
    (out as any)[0] = v;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /assignment target must be a local variable/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects for...in the same way as for...of', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, xs: Lib.UInt32[]) {
    for (const key in xs) {}
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /for\.\.\.of\/for\.\.\.in are not supported/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a bare statement kind lowerStatement does not recognize', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    return;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /cannot translate statement/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers an unbraced if body with no else clause', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, i: Lib.UInt32, v: Lib.Float32, n: Lib.UInt32) {
    if (n.lessThan(n)) out.set(i, v);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const ifNode = kernel!.body.statements[0] as unknown as {
        elseBranch: unknown;
        thenBranch: { statements: unknown[] };
      };
      expect(ifNode.elseBranch).toBeUndefined();
      expect(ifNode.thenBranch.statements).toHaveLength(1);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a for loop with every clause omitted', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    for (;;) {}
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const forNode = kernel!.body.statements[0] as unknown as {
        init: unknown;
        condition: unknown;
        update: unknown;
      };
      expect(forNode.init).toBeUndefined();
      expect(forNode.condition).toBeUndefined();
      expect(forNode.update).toBeUndefined();
    } finally {
      testProgram.cleanup();
    }
  });
});
