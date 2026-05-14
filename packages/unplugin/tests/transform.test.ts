import { expect, test, describe } from 'bun:test';
import { unplugin } from '../src/index';

describe('AOT Transformer', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (code: string, strict = false) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin = unplugin.rollup({ strict }) as any;
    const result = plugin.transform.call({ skip: () => {} }, code, 'test.ts');
    return result ? result.code : code;
  };

  test('transforms a simple static chain', () => {
    const input = `
import { rx } from '@fajarnugraha37/ts-rex';
const pattern = rx().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
    expect(output).toContain('"hello"');
    expect(output).toContain('import { hydrateRegex as __tsRexHydrate }');
  });

  test('transforms a chain with ESM import aliasing', () => {
    const input = `
import { rx as myBuilder } from '@fajarnugraha37/ts-rex';
const pattern = myBuilder().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
    expect(output).toContain('"hello"');
  });

  test('transforms a chain with CommonJS require destructuring', () => {
    const input = `
const { rx } = require('@fajarnugraha37/ts-rex');
const pattern = rx().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
    expect(output).toContain('"hello"');
  });

  test('transforms a chain with CommonJS require aliasing', () => {
    const input = `
const { rx: myBuilder } = require('@fajarnugraha37/ts-rex');
const pattern = myBuilder().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
    expect(output).toContain('"hello"');
  });

  test('transforms a chain with ES namespace import', () => {
    const input = `
import * as r from '@fajarnugraha37/ts-rex';
const pattern = r.rx().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
  });

  test('transforms a chain with CommonJS namespace require', () => {
    const input = `
const r = require('@fajarnugraha37/ts-rex');
const pattern = r.rx().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
  });

  test('transforms a chain with direct variable reassignment', () => {
    const input = `
import { rx } from '@fajarnugraha37/ts-rex';
const r = rx;
const pattern = r().literal('hello').compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
  });

  test('transforms a chain with namespace member reassignment', () => {
    const input = `
import * as rex from '@fajarnugraha37/ts-rex';
const rObj = rex;
const rFunc = rex.rx;
const pattern1 = rObj.rx().literal('hello').compile();
const pattern2 = rFunc().literal('world').compile();
    `;
    const output = transform(input);
    // Should contain two hydration calls
    expect(output).toContain('__tsRexHydrate(\n  "hello"');
    expect(output).toContain('__tsRexHydrate(\n  "world"');
  });

  test('transforms a complex static chain', () => {
    const input = `
import { rx } from '@fajarnugraha37/ts-rex';
export const mediumBuilder = rx()
  .startOfInput()
  .capture('user', rx().oneOrMore(rx().wordChar()))
  .literal('@')
  .capture('domain', rx().oneOrMore(rx().wordChar()))
  .literal('.')
  .capture('tld', rx().oneOrMore(rx().wordChar()))
  .endOfInput()
  .compile();
    `;
    const output = transform(input);
    expect(output).toContain('__tsRexHydrate(');
    expect(output).toContain('["user","domain","tld"]');
    expect(output).toContain('"^(?<user>(?:\\\\w)+)@(?<domain>(?:\\\\w)+)\\\\.(?<tld>(?:\\\\w)+)$"');
  });

  test('gracefully skips dynamic chains (fallback)', () => {
    const input = `
import { rx } from '@fajarnugraha37/ts-rex';
const word = getWord();
const pattern = rx().literal(word).compile();
    `;
    const output = transform(input);
    // Should not transform because `word` is a ReferenceError in static eval
    expect(output).not.toContain('__tsRexHydrate(');
    expect(output).toContain('compile()');
  });

  test('throws on dynamic chains if strict mode is enabled', () => {
    const input = `
import { rx } from '@fajarnugraha37/ts-rex';
const word = getWord();
const pattern = rx().literal(word).compile();
    `;
    expect(() => transform(input, true)).toThrow('Failed to statically evaluate');
  });
});
