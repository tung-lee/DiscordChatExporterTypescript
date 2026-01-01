import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  shims: true,
  sourcemap: true,
  target: 'node20',
  outDir: 'dist',
  onSuccess: async () => {
    // Add shebang to CLI entry
    const fs = await import('fs/promises');
    const cliPath = './dist/cli.js';
    try {
      const content = await fs.readFile(cliPath, 'utf-8');
      if (!content.startsWith('#!/usr/bin/env node')) {
        await fs.writeFile(cliPath, '#!/usr/bin/env node\n' + content);
      }
    } catch {
      // CLI file might not exist in CJS build
    }
  },
});
