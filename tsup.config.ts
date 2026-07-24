import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  dts: true,
  clean: true,
  sourcemap: true,
  tsconfig: 'tsconfig.build.json',
});
