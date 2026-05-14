process.noDeprecation = true; // Suppress noisy Webpack deprecation warnings in Bun

import { expect, test, describe, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';

// Plugins
import { unplugin } from '../src/index';

// Bundlers
import { build as esbuildBuild } from 'esbuild';
import { rollup } from 'rollup';
import { build as viteBuild } from 'vite';
import webpack from 'webpack';

const TEMP_DIR = path.join(__dirname, '.temp');
const INPUT_FILE = path.join(TEMP_DIR, 'input.js');
const OUTPUT_DIR = path.join(TEMP_DIR, 'dist');

const SOURCE_CODE = `
import { rx } from '@fajarnugraha37/ts-rex';

export const emailValidator = rx()
  .startOfInput()
  .capture('username', rx().oneOrMore(rx().anyOf('a-zA-Z0-9_.-')))
  .literal('@')
  .capture('domain', rx().oneOrMore(rx().anyOf('a-zA-Z0-9.-')))
  .literal('.')
  .capture('tld', rx().between(2, 6, rx().wordChar()))
  .endOfInput()
  .compile();
`;

describe('Bundler Integration Tests', () => {
  beforeAll(async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.writeFile(INPUT_FILE, SOURCE_CODE, 'utf-8');
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  });

  test('ESBuild Integration', async () => {
    const result = await esbuildBuild({
      entryPoints: [INPUT_FILE],
      plugins: [unplugin.esbuild()],
      write: false,
      format: 'esm',
      bundle: true,
      external: ['@fajarnugraha37/ts-rex']
    });

    const outputCode = result.outputFiles[0].text;
    expect(outputCode).toContain('hydrateRegex');
    expect(outputCode).toContain('"username"');
    expect(outputCode).toContain('"domain"');
    expect(outputCode).toContain('"tld"');
    expect(outputCode).not.toContain('.compile()');
  });

  test('Rollup Integration', async () => {
    const bundle = await rollup({
      input: INPUT_FILE,
      plugins: [unplugin.rollup()],
      external: ['@fajarnugraha37/ts-rex']
    });

    const { output } = await bundle.generate({ format: 'es' });
    const outputCode = output[0].code;
    
    expect(outputCode).toContain('hydrateRegex');
    expect(outputCode).toContain('"username"');
    expect(outputCode).toContain('"domain"');
    expect(outputCode).toContain('"tld"');
    expect(outputCode).not.toContain('.compile()');
  });

  test('Vite Integration', async () => {
    const result = await viteBuild({
      root: TEMP_DIR,
      build: {
        lib: { entry: INPUT_FILE, formats: ['es'] },
        write: false,
        rollupOptions: {
          external: ['@fajarnugraha37/ts-rex']
        }
      },
      plugins: [unplugin.vite()],
      logLevel: 'silent'
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputCode = (result as any)[0].output[0].code;
    
    expect(outputCode).toContain('hydrateRegex');
    expect(outputCode).toContain('"username"');
    expect(outputCode).toContain('"domain"');
    expect(outputCode).toContain('"tld"');
    expect(outputCode).not.toContain('.compile()');
  });

  test('Webpack Integration', async () => {
    const webpackModule = await import('webpack');
    const webpack = webpackModule.default || webpackModule;

    await new Promise((resolve, reject) => {
      webpack({
        mode: 'production',
        entry: INPUT_FILE,
        output: {
          path: OUTPUT_DIR,
          filename: 'webpack-out.js'
        },
        plugins: [unplugin.webpack()],
        externals: {
          '@fajarnugraha37/ts-rex': 'commonjs @fajarnugraha37/ts-rex'
        }
      }, (err, stats) => {
        if (err) return reject(err);
        if (stats?.hasErrors()) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return reject((stats.compilation as any).errors);
        }
        resolve(stats);
      });
    });

    const outputCode = await fs.readFile(path.join(OUTPUT_DIR, 'webpack-out.js'), 'utf-8');
    
    expect(outputCode).toContain('hydrateRegex');
    expect(outputCode).toContain('"username"');
    expect(outputCode).toContain('"domain"');
    expect(outputCode).toContain('"tld"');
    expect(outputCode).not.toContain('.compile()');
  });
});