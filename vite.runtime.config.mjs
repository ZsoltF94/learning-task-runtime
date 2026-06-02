import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const runtimeOutDir = 'dist-runtime';

function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const outputDir = resolve(runtimeOutDir);

      mkdirSync(outputDir, { recursive: true });
      copyFileSync(
        resolve(outputDir, 'index.html'),
        resolve(outputDir, '404.html'),
      );
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), githubPagesSpaFallback()],
  publicDir: false,
  build: {
    outDir: runtimeOutDir,
    emptyOutDir: true,
  },
});
