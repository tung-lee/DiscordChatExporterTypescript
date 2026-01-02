import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  splitting: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  shims: true,
  treeshake: true,
});
