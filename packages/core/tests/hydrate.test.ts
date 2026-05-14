import { expect, test, describe } from 'bun:test';
import { rx } from '../src/index';

describe('Hydrate 100% Coverage', () => {
  test('Fast Path: global zero-length match guard', () => {
    const compiled = rx().optional(rx().literal('a')).global().compile();
    const iter = compiled.exec('b');
    // 'b' doesn't match 'a', but 'a?' matches the empty string before and after 'b'.
    // matches: empty at 0, empty at 1.
    const results = Array.from(iter);
    expect(results.length).toBe(2);
    expect(results[0].match).toBe('');
    expect(results[1].match).toBe('');
  });

  test('Fast Path: global zero-length match guard with unicode', () => {
    // 🦄 is a surrogate pair (length 2)
    const compiled = rx().optional(rx().literal('a')).global().unicode().compile();
    const iter = compiled.exec('🦄');
    const results = Array.from(iter);
    expect(results.length).toBe(2); // empty before, empty after
  });

  test('Complex Path: global zero-length match guard', () => {
    const compiled = rx().capture('test', rx().optional(rx().literal('a'))).global().compile();
    const iter = compiled.exec('b');
    const results = Array.from(iter);
    expect(results.length).toBe(2);
    expect(results[0].test).toBe('');
  });

  test('Complex Path: global zero-length match guard with unicode', () => {
    const compiled = rx().capture('test', rx().optional(rx().literal('a'))).global().unicode().compile();
    const iter = compiled.exec('🦄');
    const results = Array.from(iter);
    expect(results.length).toBe(2);
  });
});
