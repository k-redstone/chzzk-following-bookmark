import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { 'page-bridge.esm': 'src/bridge/page-bridge.ts' },
  format: ['esm'],          // 모듈
  target: 'es2020',
  outDir: 'public',         
  sourcemap: false,
  minify: false,
  bundle: true,             
  clean: false,
  dts: false,
});
