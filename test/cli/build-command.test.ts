/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ts from 'typescript';
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runBuild } from '../../src/cli/build-command.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function createConsumerFixture(kernelSource: string): string {
  const projectDir = mkdtempSync(join(tmpdir(), 'j2ocl-build-'));
  mkdirSync(join(projectDir, 'src'), { recursive: true });
  mkdirSync(join(projectDir, 'node_modules', '@pagy0z'), { recursive: true });
  symlinkSync(REPO_ROOT, join(projectDir, 'node_modules', '@pagy0z', 'j2ocl'), 'junction');

  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ type: 'module' }));
  writeFileSync(
    join(projectDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: true,
        outDir: 'dist',
        rootDir: 'src',
      },
    }),
  );
  writeFileSync(join(projectDir, 'src', 'kernels.ts'), kernelSource);
  return projectDir;
}

const VECTOR_ADD_KERNEL = `
import { Kernel, kernel } from '@pagy0z/j2ocl';
import { FloatArray, UInt32 } from '@pagy0z/j2ocl';

export class MyKernels extends Kernel {
  @kernel
  static vectorAdd(a: FloatArray, b: FloatArray, out: FloatArray, length: UInt32) {
    for (let i: UInt32 = UInt32.of(0); i.lessThan(length); i = i.add(UInt32.of(1))) {
      out.set(i, a.get(i).add(b.get(i)));
    }
  }
}
`;

describe('runBuild', () => {
  let projectDir: string;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (projectDir) rmSync(projectDir, { recursive: true, force: true });
  });

  it('compiles a valid kernel to a .cl file mirroring the source path in outDir', () => {
    projectDir = createConsumerFixture(VECTOR_ADD_KERNEL);

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(0);
    const outputPath = join(projectDir, 'dist', 'kernels.MyKernels.vectorAdd.cl');
    const code = readFileSync(outputPath, 'utf8');
    expect(code).toBe('__kernel void vectorAdd(__global float* a, __global float* b, __global float* out, uint length) {\n' + '  for (uint i = 0u; (i < length); i = (i + 1u)) {\n' + '    out[i] = (a[i] + b[i]);\n' + '  }\n' + '}');
  });

  it('writes a *.j2ocl.js companion module (outDir) with a matching .d.ts next to the source (rootDir)', async () => {
    projectDir = createConsumerFixture(VECTOR_ADD_KERNEL);

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(0);
    const jsPath = join(projectDir, 'dist', 'kernels.j2ocl.js');
    const dtsPath = join(projectDir, 'src', 'kernels.j2ocl.d.ts');

    const js = readFileSync(jsPath, 'utf8');
    expect(js).toContain('export const MyKernels_vectorAdd =');
    expect(js).toContain('__kernel void vectorAdd');

    const dts = readFileSync(dtsPath, 'utf8');
    expect(dts).toBe('export declare const MyKernels_vectorAdd: ' + '{ className: string; name: string; source: string };\n');

    const imported = (await import(pathToFileURL(jsPath).href)) as {
      MyKernels_vectorAdd: { className: string; name: string; source: string };
    };
    expect(imported.MyKernels_vectorAdd).toEqual({
      className: 'MyKernels',
      name: 'vectorAdd',
      source: readFileSync(join(projectDir, 'dist', 'kernels.MyKernels.vectorAdd.cl'), 'utf8'),
    });
  });

  it('lets a consumer file statically import the companion module without type errors', () => {
    projectDir = createConsumerFixture(VECTOR_ADD_KERNEL);
    writeFileSync(
      join(projectDir, 'src', 'main.ts'),
      `
import { MyKernels_vectorAdd } from './kernels.j2ocl.js';
console.log(MyKernels_vectorAdd.source);
`,
    );

    expect(runBuild(join(projectDir, 'tsconfig.json'))).toBe(0);

    const configFile = ts.readConfigFile(join(projectDir, 'tsconfig.json'), (path) => ts.sys.readFile(path));
    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectDir);
    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);

    expect(ts.getPreEmitDiagnostics(program)).toHaveLength(0);
  });

  it('groups multiple kernels from the same source file into one companion module', () => {
    projectDir = createConsumerFixture(`
import { Kernel, kernel } from '@pagy0z/j2ocl';
import { FloatArray, UInt32 } from '@pagy0z/j2ocl';

export class MyKernels extends Kernel {
  @kernel
  static vectorAdd(a: FloatArray, b: FloatArray, out: FloatArray, length: UInt32) {
    for (let i: UInt32 = UInt32.of(0); i.lessThan(length); i = i.add(UInt32.of(1))) {
      out.set(i, a.get(i).add(b.get(i)));
    }
  }

  @kernel
  static vectorSub(a: FloatArray, b: FloatArray, out: FloatArray, length: UInt32) {
    for (let i: UInt32 = UInt32.of(0); i.lessThan(length); i = i.add(UInt32.of(1))) {
      out.set(i, a.get(i).sub(b.get(i)));
    }
  }
}
`);

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(0);
    const js = readFileSync(join(projectDir, 'dist', 'kernels.j2ocl.js'), 'utf8');
    expect(js).toContain('export const MyKernels_vectorAdd =');
    expect(js).toContain('export const MyKernels_vectorSub =');
  });

  it('returns 1 and writes nothing for an invalid @kernel placement', () => {
    projectDir = createConsumerFixture(`
import { kernel } from '@pagy0z/j2ocl';

export class NotAKernelSubclass {
  @kernel
  static bad() {}
}
`);

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(1);
    expect(() => readFileSync(join(projectDir, 'dist', 'kernels.NotAKernelSubclass.bad.cl'))).toThrow();
  });

  it('returns 1 and writes nothing for a kernel that fails to compile', () => {
    projectDir = createConsumerFixture(`
import { Kernel, kernel } from '@pagy0z/j2ocl';
import { UInt32 } from '@pagy0z/j2ocl';

export class MyKernels extends Kernel {
  @kernel
  static bad(xs: UInt32[]) {
    for (const x of xs) {}
  }
}
`);

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(1);
    expect(() => readFileSync(join(projectDir, 'dist', 'kernels.MyKernels.bad.cl'))).toThrow();
  });

  it('returns 1 when the tsconfig has no outDir', () => {
    projectDir = createConsumerFixture(VECTOR_ADD_KERNEL);
    writeFileSync(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          rootDir: 'src',
        },
      }),
    );

    expect(runBuild(join(projectDir, 'tsconfig.json'))).toBe(1);
  });

  it('infers rootDir from the common source directory when the tsconfig omits it', () => {
    projectDir = createConsumerFixture(VECTOR_ADD_KERNEL);
    writeFileSync(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          outDir: 'dist',
        },
      }),
    );

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(0);
    const code = readFileSync(join(projectDir, 'dist', 'kernels.MyKernels.vectorAdd.cl'), 'utf8');
    expect(code).toContain('__kernel void vectorAdd');
  });

  it('infers rootDir as the common ancestor across multiple source subdirectories', () => {
    projectDir = mkdtempSync(join(tmpdir(), 'j2ocl-build-'));
    mkdirSync(join(projectDir, 'src', 'math'), { recursive: true });
    mkdirSync(join(projectDir, 'src', 'utils'), { recursive: true });
    mkdirSync(join(projectDir, 'node_modules', '@pagy0z'), { recursive: true });
    symlinkSync(REPO_ROOT, join(projectDir, 'node_modules', '@pagy0z', 'j2ocl'), 'junction');
    writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ type: 'module' }));
    writeFileSync(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          skipLibCheck: true,
          outDir: 'dist',
        },
      }),
    );
    writeFileSync(join(projectDir, 'src', 'math', 'kernels.ts'), VECTOR_ADD_KERNEL);
    writeFileSync(join(projectDir, 'src', 'utils', 'helper.ts'), 'export const noop = (): void => {};\n');

    const exitCode = runBuild(join(projectDir, 'tsconfig.json'));

    expect(exitCode).toBe(0);
    const code = readFileSync(join(projectDir, 'dist', 'math', 'kernels.MyKernels.vectorAdd.cl'), 'utf8');
    expect(code).toContain('__kernel void vectorAdd');
  });

  it('reports "nothing to do" and returns 0 when no kernels are found', () => {
    projectDir = createConsumerFixture(`export const notAKernel = 1;\n`);

    expect(runBuild(join(projectDir, 'tsconfig.json'))).toBe(0);
  });

  it('returns 1 when the tsconfig is not valid JSON', () => {
    projectDir = mkdtempSync(join(tmpdir(), 'j2ocl-build-'));
    writeFileSync(join(projectDir, 'tsconfig.json'), '{ not valid json');

    expect(runBuild(join(projectDir, 'tsconfig.json'))).toBe(1);
  });

  it('returns 1 when the tsconfig has structurally invalid compiler options', () => {
    projectDir = mkdtempSync(join(tmpdir(), 'j2ocl-build-'));
    writeFileSync(join(projectDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 12345 } }));

    expect(runBuild(join(projectDir, 'tsconfig.json'))).toBe(1);
  });
});
