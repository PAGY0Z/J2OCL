/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { transformSync } from 'esbuild';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const TS_SOURCE_FILE = /\.(ts|mts|cts)$/;
const TS_DECLARATION_FILE = /\.d\.(ts|mts|cts)$/;

function decoratorSupportPlugin(): Plugin {
  return {
    name: 'decorator-support',
    enforce: 'pre',
    transform(code, id) {
      if (!TS_SOURCE_FILE.test(id) || TS_DECLARATION_FILE.test(id)) return null;
      const result = transformSync(code, {
        loader: 'ts',
        target: 'es2022',
        sourcefile: id,
        sourcemap: true,
      });
      return { code: result.code, map: result.map || null };
    },
  };
}

export default defineConfig({
  plugins: [decoratorSupportPlugin()],
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
    },
  },
});
