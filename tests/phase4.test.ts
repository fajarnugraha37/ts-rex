import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx } from '../src/index';

describe('Phase 4: Flags & Execution Engine', () => {
  describe('Flags compilation', () => {
    test('should compile with no flags', () => {
      const reg = rx().literal('a').compile().native;
      expect(reg.flags).toBe('');
    });

    test('should compile with correct flags string', () => {
      const reg = rx()
        .literal('a')
        .global()
        .ignoreCase()
        .multiline()
        .dotAll()
        .unicode()
        .sticky()
        .withIndices()
        .compile()
        .native;
      
      // Native RegExp sorts flags alphabetically
      expect(reg.flags).toBe('dgimsuy');
    });

    test('unicodeSets flag (v)', () => {
      // We can't actually test the native execution if the runtime doesn't support 'v'
      // but we can test that the builder outputs it correctly.
      const compiled = rx().literal('a').unicodeSets().compile();
      expect(compiled.native.flags).toBe('v');
    });
  });

  describe('Stateless Execution Wrapper', () => {
    test('standard non-global match returns captured object', () => {
      const b = rx()
        .startOfInput()
        .capture('firstName', rx().oneOrMore(rx().wordChar()))
        .whitespace()
        .capture('lastName', rx().oneOrMore(rx().wordChar()))
        .endOfInput();

      const result = b.compile().exec('John Doe');

      // Due to the generic Record<never, never> merging we use Simplify or just assert structural match
      expect(result).toMatchObject({ firstName: 'John', lastName: 'Doe' });
    });

    test('standard non-global match returns null on failure', () => {
      const b = rx().literal('apple').capture('val', rx().anyChar());
      const result = b.compile().exec('banana');
      expect(result).toBeNull();
    });

    test('global match returns an IterableIterator', () => {
      const b = rx().capture('num', rx().oneOrMore(rx().digit())).global();
      const compiled = b.compile();
      
      const result = compiled.exec('I have 3 apples and 42 bananas');

      const matches = Array.from(result);
      expect(matches.length).toBe(2);
      expect(matches[0]).toEqual({ num: '3' });
      expect(matches[1]).toEqual({ num: '42' });
    });

    test('global execution is completely stateless', () => {
      const b = rx().capture('num', rx().digit()).global();
      const compiled = b.compile();

      const text = '1 2 3';
      
      // Call it once
      const firstRun = Array.from(compiled.exec(text));
      expect(firstRun.length).toBe(3);

      // Call it again on the EXACT same compiled instance
      // If it was stateful, lastIndex would be at the end, and this would return 0 matches.
      const secondRun = Array.from(compiled.exec(text));
      expect(secondRun.length).toBe(3);
    });

    test('sticky (y) execution is completely stateless', () => {
      const b = rx().capture('num', rx().digit()).sticky();
      const compiled = b.compile();

      const text = '1';
      
      const firstRun = compiled.exec(text);
      expect(firstRun).toEqual({ num: '1' });

      // Call it again. A stateful sticky regex would fail here because lastIndex=1.
      const secondRun = compiled.exec(text);
      expect(secondRun).toEqual({ num: '1' });
    });

    test('withIndices (d) injects indices property at type level and runtime', () => {
      const b = rx().capture('num', rx().digit()).withIndices();
      const compiled = b.compile();

      const text = 'a1b';
      const result = compiled.exec(text);
      
      // Type assertion: result should have an `indices` property mapping 'num' to [number, number]
      expectTypeOf(result).toMatchTypeOf<{ num: string; indices: { num: [number, number] } } | null>();
      
      expect(result).not.toBeNull();
      expect(result?.num).toBe('1');
      expect(result?.indices).toBeDefined();
      expect(result?.indices.num).toEqual([1, 2]);
    });
  });
});