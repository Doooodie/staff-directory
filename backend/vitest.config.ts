import path from 'node:path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: false,
  test: { globals: true },
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
});
