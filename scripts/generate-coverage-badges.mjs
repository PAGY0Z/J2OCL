/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const summaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json');
const outDir = path.join(rootDir, 'coverage-badges');

function colorFor(pct) {
  if (pct >= 90) return 'brightgreen';
  if (pct >= 75) return 'green';
  if (pct >= 50) return 'yellow';
  if (pct >= 25) return 'orange';
  return 'red';
}

function writeBadge(fileName, label, pct) {
  const rounded = Math.round(pct * 10) / 10;
  const badge = {
    schemaVersion: 1,
    label,
    message: `${rounded}%`,
    color: colorFor(rounded),
  };
  writeFileSync(path.join(outDir, fileName), JSON.stringify(badge));
}

const { total } = JSON.parse(readFileSync(summaryPath, 'utf8'));

mkdirSync(outDir, { recursive: true });
writeBadge('lines.json', 'coverage: lines', total.lines.pct);
writeBadge('branches.json', 'coverage: branches', total.branches.pct);

console.log(
  `Generated coverage badges: lines ${total.lines.pct}%, branches ${total.branches.pct}%.`,
);
