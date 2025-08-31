import { defineConfig } from 'tsup';

export default defineConfig([
  // Main CLI entry point
  {
    name: 'cli',
    entry: { 'turbokit-cli': 'scripts/turbokit-cli.ts' },
    outDir: 'dist/scripts',
    sourcemap: true,
    minify: false,
    dts: false,
    format: ['cjs'],
    shims: true,
    clean: true,
  },
  // ACP server
  {
    name: 'acp',
    entry: { 'turbokit-acp-server': 'scripts/turbokit-acp-server.ts' },
    outDir: 'dist/scripts',
    sourcemap: true,
    minify: false,
    dts: false,
    format: ['cjs'],
    shims: true,
    clean: false,
    external: ['@zed-industries/agent-client-protocol'],
  },
]);