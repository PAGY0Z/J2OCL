/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { detectKernels } from '../../../src/cli/detection/detect-kernels.js';
import { IRAssignExpr, IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from '../../../src/compiler/ir/expressions.js';
import { IRExpressionStatement } from '../../../src/compiler/ir/statements.js';
import type { LoweringAnchors } from '../../../src/compiler/lowering-anchors.js';
import type { LoweringContext } from '../../../src/compiler/lowering/context.js';
import { lowerExpression } from '../../../src/compiler/lowering/expressions.js';
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

function findClass(testProgram: TestProgram, name: string) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  return libSourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === name)!;
}

function findFunction(testProgram: TestProgram, name: string) {
  const libSourceFile = testProgram.getSourceFile('lib.ts');
  return libSourceFile.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)!;
}

function getAnchors(testProgram: TestProgram) {
  const kernelClass = findClass(testProgram, 'Kernel');
  const kernelDecorator = findFunction(testProgram, 'kernel');
  const loweringAnchors: LoweringAnchors = {
    getGlobalId: findFunction(testProgram, 'getGlobalId'),
    types: new Map([
      ['UInt32', findClass(testProgram, 'UInt32')],
      ['Bool', findClass(testProgram, 'Bool')],
      ['FloatArray', findClass(testProgram, 'FloatArray')],
      ['Float32', findClass(testProgram, 'Float32')],
    ]),
  };
  return { kernelClass, kernelDecorator, loweringAnchors };
}

function lowerSource(testProgram: TestProgram, anchors: ReturnType<typeof getAnchors>) {
  const { kernels } = detectKernels(testProgram.program, anchors);
  return lowerKernel(kernels[0], testProgram.checker, anchors.loweringAnchors);
}

describe('lowerKernel — expressions', () => {
  it('lowers a literal built via .of() to IRLiteral', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const i: Lib.UInt32 = Lib.UInt32.of(0);
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0];
      expect(declaration).toMatchObject({ name: 'i', type: 'UInt32' });
      expect((declaration as unknown as { initializer: IRLiteral }).initializer).toBeInstanceOf(IRLiteral);
      expect((declaration as unknown as { initializer: IRLiteral }).initializer.value).toBe(0);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers an identifier reference to IRIdentifier with its declared type', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    const i: Lib.UInt32 = n;
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: IRIdentifier;
      };
      expect(declaration.initializer).toBeInstanceOf(IRIdentifier);
      expect(declaration.initializer.name).toBe('n');
      expect(declaration.initializer.type).toBe('UInt32');
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a method call to IRMethodCall with the resolved receiver type', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(a: Lib.FloatArray, n: Lib.UInt32) {
    const cond: Lib.Bool = n.lessThan(n);
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: IRMethodCall;
      };
      expect(declaration.initializer).toBeInstanceOf(IRMethodCall);
      expect(declaration.initializer.methodName).toBe('lessThan');
      expect(declaration.initializer.type).toBe('Bool');
      expect(declaration.initializer.args).toHaveLength(1);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a call to the real getGlobalId to IRIntrinsicCall, not IRMethodCall', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const i: Lib.UInt32 = Lib.getGlobalId(0);
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: IRIntrinsicCall;
      };
      expect(declaration.initializer).toBeInstanceOf(IRIntrinsicCall);
      expect(declaration.initializer.name).toBe('getGlobalId');
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers out.set(i, v) to an IRExpressionStatement wrapping an IRMethodCall named set', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, i: Lib.UInt32, v: Lib.Float32) {
    out.set(i, v);
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const statement = kernel!.body.statements[0];
      expect(statement).toBeInstanceOf(IRExpressionStatement);
      const call = (statement as IRExpressionStatement).expression as IRMethodCall;
      expect(call).toBeInstanceOf(IRMethodCall);
      expect(call.methodName).toBe('set');
      expect(call.args).toHaveLength(2);
    } finally {
      testProgram.cleanup();
    }
  });

  it('lowers a reassignment to IRAssignExpr', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    let i: Lib.UInt32 = Lib.UInt32.of(0);
    i = i.add(Lib.UInt32.of(1));
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics).toEqual([]);
      const statement = kernel!.body.statements[1];
      expect(statement).toBeInstanceOf(IRExpressionStatement);
      const assign = (statement as IRExpressionStatement).expression as IRAssignExpr;
      expect(assign).toBeInstanceOf(IRAssignExpr);
      expect(assign.target.name).toBe('i');
      expect(assign.value).toBeInstanceOf(IRMethodCall);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic for a reference to an unresolved external identifier, instead of throwing', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const i: Lib.UInt32 = Math.floor(1) as unknown as Lib.UInt32;
  }
}
`,
    });

    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);

      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0].message).toMatch(/Math/);
    } finally {
      testProgram.cleanup();
    }
  });
});

describe('lowerKernel — expression diagnostics', () => {
  it('rejects a bare numeric literal not wrapped via .of()', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const i: Lib.UInt32 = 5;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /must be wrapped via a scalar type's \.of\(\)/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a bare boolean literal not wrapped via .of()', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const b: Lib.Bool = true;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /must be wrapped via a scalar type's \.of\(\)/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a property read on a receiver that is not a recognized J2OCL type', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = (Math.PI as unknown) as Lib.UInt32;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /receiver is not a recognized J2OCL type/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a native binary operator used instead of a method call', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, a: Lib.UInt32, b: Lib.UInt32) {
    const x: Lib.UInt32 = (a as unknown as number) + (b as unknown as number) as unknown as Lib.UInt32;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /cannot translate expression/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a non-literal argument to an intrinsic call', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    const i: Lib.UInt32 = Lib.getGlobalId(n as unknown as 0);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /intrinsic argument .* must be a numeric literal/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a call whose callee is a bare identifier, not a property access', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';
import { bareFn } from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    bareFn();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /cannot translate call/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects .of() called on a class that is not a recognized J2OCL type', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = (Lib.NotAJ2OCLType.of(5) as unknown) as Lib.UInt32;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /receiver is not a recognized J2OCL type/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects .of() called with zero arguments', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = Lib.UInt32.of();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /\.of\(\) requires exactly one literal argument/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects .of() called with a non-literal argument', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    const x: Lib.UInt32 = Lib.UInt32.of(n as unknown as number);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /\.of\(\) argument must be a literal/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('accepts a negative literal passed to .of()', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = Lib.UInt32.of(-1);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: { value: number };
      };
      expect(declaration.initializer.value).toBe(-1);
    } finally {
      testProgram.cleanup();
    }
  });

  it('accepts a boolean literal passed to .of()', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.Bool = Lib.Bool.of(true);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: { value: boolean };
      };
      expect(declaration.initializer.value).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('falls back to void when a property read resolves a receiver but not a result type', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x = out.capacity;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: { type: string };
      };
      expect(declaration.initializer.type).toBe('void');
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects ".length" read on an array inside a kernel body', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const n: Lib.UInt32 = out.length;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /\.length.*cannot be used/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a method call with no OpenCL C translation instead of crashing', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(a: Lib.UInt32, out: Lib.FloatArray) {
    const raw = a.valueOf();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /not a supported J2OCL operation/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for .get() called with zero arguments', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    // @ts-expect-error deliberately wrong arity, bypassing tsc, to probe the compiler
    const x = out.get();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /"get" expects 1 argument\(s\), got 0/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for .set() called with only one argument', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, i: Lib.UInt32) {
    // @ts-expect-error deliberately wrong arity, bypassing tsc, to probe the compiler
    out.set(i);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /"set" expects 2 argument\(s\), got 1/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for a binary operator method called with zero arguments', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    // @ts-expect-error deliberately wrong arity, bypassing tsc, to probe the compiler
    const x = n.add();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /"add" expects 1 argument\(s\), got 0/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for a binary operator method called with two arguments', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    // @ts-expect-error deliberately wrong arity, bypassing tsc, to probe the compiler
    const x = n.add(n, n);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /"add" expects 1 argument\(s\), got 2/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('reports a diagnostic, not a crash, for a unary-prefix operator method called with an argument', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray, n: Lib.UInt32) {
    // @ts-expect-error deliberately wrong arity, bypassing tsc, to probe the compiler
    const x = n.negate(n);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(kernel).toBeUndefined();
      expect(diagnostics.some((d) => /"negate" expects 0 argument\(s\), got 1/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects a call whose callee resolves to no symbol at all', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    (0)();
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /cannot translate call/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });

  it('recognizes Type.of(literal) when Type was imported by name, not via the namespace', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';
import { UInt32 } from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = UInt32.of(3);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { kernel, diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics).toEqual([]);
      const declaration = kernel!.body.statements[0] as unknown as {
        initializer: { value: number };
      };
      expect(declaration.initializer.value).toBe(3);
    } finally {
      testProgram.cleanup();
    }
  });

  it('rejects .of() called on a receiver that resolves to no symbol at all', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const x: Lib.UInt32 = (UndeclaredThing as any).of(5);
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.length).toBeGreaterThan(0);
    } finally {
      testProgram.cleanup();
    }
  });

  it('falls back to void for a variable with no type annotation whose initializer is untranslatable', () => {
    const testProgram = createTestProgram({
      'lib.ts': LIB_SOURCE,
      'consumer.ts': `
import * as Lib from './lib.js';

class Kernels extends Lib.Kernel {
  @Lib.kernel
  static k(out: Lib.FloatArray) {
    const bad = undeclaredThing;
  }
}
`,
    });
    try {
      const anchors = getAnchors(testProgram);
      const { diagnostics } = lowerSource(testProgram, anchors);
      expect(diagnostics.some((d) => /unresolved identifier "undeclaredThing"/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });
});

describe('lowerCall (via lowerExpression) — defensive: unnamed getGlobalId anchor', () => {
  it('never matches the intrinsic when its anchor declaration has no name, and reports a diagnostic instead', () => {
    const testProgram = createTestProgram({
      'lib.ts': `
export declare class UInt32 {
  static of(raw: number): UInt32;
}

export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;
`,
      'consumer.ts': `
import * as Lib from './lib.js';
const x: Lib.UInt32 = Lib.getGlobalId(0);
`,
    });
    try {
      const consumerSourceFile = testProgram.getSourceFile('consumer.ts');
      const declaration = consumerSourceFile.statements.find(ts.isVariableStatement)!;
      const callExpression = declaration.declarationList.declarations[0].initializer as ts.CallExpression;

      const unnamedFunction = ts.factory.createFunctionDeclaration(undefined, undefined, undefined, undefined, [], undefined, undefined);

      const anchors: LoweringAnchors = {
        getGlobalId: unnamedFunction,
        types: new Map([['UInt32', findClass(testProgram, 'UInt32')]]),
      };

      const ctx: LoweringContext = {
        checker: testProgram.checker,
        anchors,
        scope: new Map(),
        diagnostics: [],
      };

      lowerExpression(callExpression, ctx);
      expect(ctx.diagnostics.some((d) => /cannot translate call/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });
});

describe('lowerCall .of() detection — defensive: unnamed type anchor', () => {
  it('skips an unnamed anchor entry while scanning for a .of() match, and reports a diagnostic instead of matching', () => {
    const testProgram = createTestProgram({
      'lib.ts': `
export declare class UInt32 {
  static of(raw: number): UInt32;
}

export declare function getGlobalId(dimension: 0 | 1 | 2): UInt32;
`,
      'consumer.ts': `
import * as Lib from './lib.js';
const x: Lib.UInt32 = Lib.UInt32.of(0);
`,
    });
    try {
      const consumerSourceFile = testProgram.getSourceFile('consumer.ts');
      const declaration = consumerSourceFile.statements.find(ts.isVariableStatement)!;
      const callExpression = declaration.declarationList.declarations[0].initializer as ts.CallExpression;

      const unnamedClass = ts.factory.createClassDeclaration(undefined, undefined, undefined, undefined, []);

      const anchors: LoweringAnchors = {
        getGlobalId: findFunction(testProgram, 'getGlobalId'),
        types: new Map([['UInt32', unnamedClass]]),
      };

      const ctx: LoweringContext = {
        checker: testProgram.checker,
        anchors,
        scope: new Map(),
        diagnostics: [],
      };

      lowerExpression(callExpression, ctx);
      expect(ctx.diagnostics.some((d) => /receiver is not a recognized J2OCL type/.test(d.message))).toBe(true);
    } finally {
      testProgram.cleanup();
    }
  });
});
