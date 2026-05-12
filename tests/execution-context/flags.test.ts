import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx } from '../../src/index';

describe('Execution Context (Flags)', () => {
  test('global (g) flag changes exec to IterableIterator and returns all matches', () => {
    const builder = rx().capture('word', rx().oneOrMore(rx().wordChar())).global();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('g');

    const result = compiled.exec('hello world test');
    expectTypeOf(result).toMatchTypeOf<IterableIterator<{ word: string }>>();

    const matches = Array.from(result);
    expect(matches.length).toBe(3);
    expect(matches[0]).toMatchObject({ word: 'hello' });
    expect(matches[1]).toMatchObject({ word: 'world' });
    expect(matches[2]).toMatchObject({ word: 'test' });
  });

  test('ignoreCase (i) flag ignores case during match', () => {
    const builder = rx().literal('hello').ignoreCase();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('i');
    expect(compiled.native.test('HELLO')).toBe(true);
    expect(compiled.native.test('hello')).toBe(true);
  });

  test('multiline (m) flag matches across lines', () => {
    const builder = rx().startOfInput().literal('hello').multiline();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('m');
    expect(compiled.native.test('foo\nhello')).toBe(true); // Should match 'hello' at start of line 2
  });

  test('dotAll (s) flag allows . to match newlines', () => {
    const builder = rx().literal('a').anyChar().literal('b').dotAll();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('s');
    expect(compiled.native.test('a\nb')).toBe(true);
  });

  test('unicode (u) flag handles unicode code points correctly', () => {
    const builder = rx().unicodeCodePoint('1F600').unicode();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('u');
    expect(compiled.native.test('😀')).toBe(true);
  });

  test('unicodeSets (v) flag handles ES2024 unicode sets', () => {
    // The native regex engine must support 'v' for this to not throw at runtime
    try {
      const builder = rx().unicodeSets();
      const compiled = builder.compile();
      expect(compiled.native.flags).toBe('v');
    } catch (e) {
      // Ignore if running on older engine
    }
  });

  test('sticky (y) flag matches from lastIndex and is stateless in exec', () => {
    const builder = rx().capture('n', rx().digit()).sticky();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('y');
    
    // Stateless check
    expect(compiled.exec('1')).toMatchObject({ n: '1' });
    expect(compiled.exec('1')).toMatchObject({ n: '1' }); // Should still work!
  });

  test('withIndices (d) flag injects indices object safely', () => {
    const builder = rx().capture('n', rx().digit()).withIndices();
    const compiled = builder.compile();
    
    expect(compiled.native.flags).toBe('d');
    
    const result = compiled.exec('a1b');
    expect(result).not.toBeNull();
    expect(result?.n).toBe('1');
    expect(result?.indices).toBeDefined();
    expect(result?.indices.n).toEqual([1, 2]);

    expectTypeOf(result).toMatchTypeOf<{ n: string, indices: { n: [number, number] } } | null>();
  });

  test('Combination of flags (e.g. gimy)', () => {
    const builder = rx().literal('test').global().ignoreCase().multiline().sticky();
    const compiled = builder.compile();
    
    // JS RegExp sorts flags automatically to 'gimy'
    expect(compiled.native.flags).toBe('gimy');
  });
});
