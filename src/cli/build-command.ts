/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { compileKernel } from '../compiler/compile-kernel.js';
import type { Diagnostic } from '../compiler/diagnostic.js';
import { detectKernels } from './detection/detect-kernels.js';
import { resolvePackageAnchors } from './anchors/resolve-package-anchors.js';

const PACKAGE_NAME = '@pagy0z/j2ocl';
const ANCHOR_FILE_NAME = '.j2ocl-anchor-scan.ts';
const ANCHOR_IMPORTS = ['Kernel', 'kernel', 'getGlobalId', 'Int8', 'UInt8', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Int64', 'UInt64', 'Float32', 'Float64', 'Bool', 'CharArray', 'UCharArray', 'ShortArray', 'UShortArray', 'IntArray', 'UIntArray', 'LongArray', 'ULongArray', 'FloatArray', 'DoubleArray'];

function formatDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.file}:${diagnostic.line}:${diagnostic.column} - ${diagnostic.message}`;
}

function commonPrefix(a: string[], b: string[]): string[] {
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) {
    length++;
  }
  return a.slice(0, length);
}

function inferRootDir(fileNames: readonly string[]): string {
  const dirSegments = fileNames.map((file) => dirname(file).split(/[\\/]/));
  const common = dirSegments.reduce((acc, segments) => commonPrefix(acc, segments));
  return common.join('/');
}

interface CompiledEntry {
  outputPath: string;
  code: string;
  relativeSourcePath: string;
  className: string;
  methodName: string;
}

function writeCompanionModule(jsPathWithoutExtension: string, dtsPathWithoutExtension: string, entries: CompiledEntry[]): void {
  const jsLines = entries.map((entry) => {
    const exportName = `${entry.className}_${entry.methodName}`;
    const value = JSON.stringify({
      className: entry.className,
      name: entry.methodName,
      source: entry.code,
    });
    return `export const ${exportName} = ${value};`;
  });
  writeFileSync(`${jsPathWithoutExtension}.js`, `${jsLines.join('\n')}\n`, 'utf8');

  const dtsLines = entries.map((entry) => {
    const exportName = `${entry.className}_${entry.methodName}`;
    return `export declare const ${exportName}: { className: string; name: string; source: string };`;
  });
  writeFileSync(`${dtsPathWithoutExtension}.d.ts`, `${dtsLines.join('\n')}\n`, 'utf8');
}

export function runBuild(projectPath: string): number {
  const resolvedProjectPath = resolve(projectPath).replace(/\\/g, '/');
  const configFile = ts.readConfigFile(resolvedProjectPath, (path) => ts.sys.readFile(path));
  if (configFile.error) {
    console.error(`j2ocl build: could not read "${resolvedProjectPath}"`);
    console.error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
    return 1;
  }

  const projectRoot = dirname(resolvedProjectPath);
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectRoot);
  if (parsedConfig.errors.length > 0) {
    for (const error of parsedConfig.errors) {
      console.error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    }
    return 1;
  }

  const { options, fileNames } = parsedConfig;
  const outDir = options.outDir;
  if (!outDir) {
    console.error('j2ocl build: your tsconfig.json must set "compilerOptions.outDir"');
    return 1;
  }
  const rootDir = options.rootDir ?? inferRootDir(fileNames);

  const anchorFilePath = join(projectRoot, ANCHOR_FILE_NAME);
  writeFileSync(anchorFilePath, `import { ${ANCHOR_IMPORTS.join(', ')} } from '${PACKAGE_NAME}';\n`, 'utf8');

  try {
    const program = ts.createProgram([...fileNames, anchorFilePath], options);
    const checker = program.getTypeChecker();
    const anchorSourceFile = program.getSourceFile(anchorFilePath)!;

    const { kernelAnchors, loweringAnchors } = resolvePackageAnchors(program, anchorSourceFile);

    const { kernels, diagnostics } = detectKernels(program, kernelAnchors);
    if (diagnostics.length > 0) {
      console.error(`j2ocl build: ${diagnostics.length} invalid @kernel placement(s):`);
      for (const diagnostic of diagnostics) {
        console.error(`  ${formatDiagnostic(diagnostic)}`);
      }
      return 1;
    }

    if (kernels.length === 0) {
      console.log('j2ocl build: no @kernel methods found — nothing to do.');
      return 0;
    }

    const compiled: CompiledEntry[] = [];
    const failures: Diagnostic[] = [];

    for (const descriptor of kernels) {
      const result = compileKernel(descriptor, checker, loweringAnchors);
      if (!result.ok) {
        failures.push(...result.diagnostics);
        continue;
      }
      const relativeSourcePath = relative(rootDir, descriptor.filePath).replace(/\.ts$/, '');
      const outputPath = join(outDir, `${relativeSourcePath}.${descriptor.className}.${descriptor.methodName}.cl`);
      compiled.push({
        outputPath,
        code: result.code,
        relativeSourcePath,
        className: descriptor.className,
        methodName: descriptor.methodName,
      });
    }

    if (failures.length > 0) {
      console.error(`j2ocl build: ${failures.length} kernel(s) failed to compile:`);
      for (const diagnostic of failures) {
        console.error(`  ${formatDiagnostic(diagnostic)}`);
      }
      return 1;
    }

    for (const { outputPath, code } of compiled) {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, code, 'utf8');
    }

    const bySourceFile = new Map<string, CompiledEntry[]>();
    for (const entry of compiled) {
      const existing = bySourceFile.get(entry.relativeSourcePath);
      if (existing) {
        existing.push(entry);
      } else {
        bySourceFile.set(entry.relativeSourcePath, [entry]);
      }
    }
    for (const [relativeSourcePath, entries] of bySourceFile) {
      writeCompanionModule(join(outDir, `${relativeSourcePath}.j2ocl`), join(rootDir, `${relativeSourcePath}.j2ocl`), entries);
    }

    console.log(`j2ocl build: compiled ${compiled.length} kernel(s):`);
    for (const { outputPath } of compiled) {
      console.log(`  ${relative(process.cwd(), outputPath)}`);
    }
    return 0;
  } finally {
    unlinkSync(anchorFilePath);
  }
}
