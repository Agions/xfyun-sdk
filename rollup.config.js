import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'XfyunSDK',
      file: pkg.browser,
      format: 'umd',
      exports: 'named',
      sourcemap: true,
      globals: {
        'crypto-js': 'CryptoJS',
        'react': 'React'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      terser()
    ],
    external: ['crypto-js', 'react']
  },
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', exports: 'named', sourcemap: true },
      { file: pkg.module, format: 'es', exports: 'named', sourcemap: true }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['crypto-js', 'react']
  }
]; 