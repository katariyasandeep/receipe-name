import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Cast: vitest resolves Vite 5 types; @sveltejs/kit uses workspace Vite 6.
  plugins: [sveltekit() as never],
  resolve: {
    alias: {
      $lib: resolve(root, 'src/lib')
    }
  },
  optimizeDeps: {
    exclude: ['@recipe-finder/recipe-ui']
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['src/**/*.svelte']
  }
});
