#!/usr/bin/env node

/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { runBuild } from './build-command.js';

function findOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const [, , command, ...rest] = process.argv;

if (command === 'build') {
  const projectPath = findOption(rest, '--project') ?? './tsconfig.json';
  process.exit(runBuild(projectPath));
} else {
  console.error(`j2ocl: unknown command "${command ?? ''}" — usage: j2ocl build [--project <path>]`);
  process.exit(1);
}
