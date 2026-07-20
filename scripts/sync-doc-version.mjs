/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageJsonPath = path.join(rootDir, 'package.json');
const docPath = path.join(rootDir, 'documentations', 'index.html');

const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const year = new Date().getFullYear();

function replaceSpan(html, id, value) {
  const pattern = new RegExp(`<span id="${id}">.*?</span>`);
  if (!pattern.test(html)) {
    throw new Error(`Could not find <span id="${id}"> in ${docPath}`);
  }
  return html.replace(pattern, `<span id="${id}">${value}</span>`);
}

let html = readFileSync(docPath, 'utf8');
html = replaceSpan(html, 'doc-version', version);
html = replaceSpan(html, 'doc-year', year);

writeFileSync(docPath, html);

console.log(
  `Synced documentations/index.html to version ${version} (${year}).`,
);
