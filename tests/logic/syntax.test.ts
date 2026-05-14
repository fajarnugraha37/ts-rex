import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx } from '../../src/index';

describe('Logic & Syntax', () => {
  describe('Disjunction (.or)', () => {
    test('or merges types for mutual exclusivity', () => {
      const b1 = rx().capture('foo', rx().literal('foo'));
      const b2 = rx().capture('bar', rx().literal('bar'));
      
      const union = b1.or(b2);
      expect(union.compile().pattern).toBe('(?:(?<foo>foo)|(?<bar>bar))');

      const r1 = union.compile().exec('foo');
      expectTypeOf(r1).toMatchTypeOf<{ match: string, foo?: string; bar?: string } | null>();
      
      expect(r1).toMatchObject({ match: 'foo', foo: 'foo' });
      if (r1) {
        expect(r1.bar).toBeUndefined();
      }

      const r2 = union.compile().exec('bar');
      expect(r2).toMatchObject({ match: 'bar', bar: 'bar' });
      if (r2) {
        expect(r2.foo).toBeUndefined();
      }
    });

    test('complex nested OR logic', () => {
      const condition = rx()
        .literal('prefix_')
        .or(rx().literal('fallback_'))
        .capture('id', rx().oneOrMore(rx().digit()));

      expect(condition.compile().pattern).toBe('(?:prefix_|fallback_)(?<id>(?:\\d)+)');
    });
  });

  describe('Lookarounds', () => {
    test('lookahead (?=x)', () => {
      // match "foo" only if followed by "bar"
      const b = rx().literal('foo').lookahead(rx().literal('bar'));
      const compiled = b.compile();
      expect(compiled.pattern).toBe('foo(?=bar)');
      expect(compiled.toRegExp().test('foobar')).toBe(true);
      expect(compiled.toRegExp().test('foobaz')).toBe(false);
    });

    test('negativeLookahead (?!x)', () => {
      // match "foo" only if NOT followed by "bar"
      const b = rx().literal('foo').negativeLookahead(rx().literal('bar'));
      const compiled = b.compile();
      expect(compiled.pattern).toBe('foo(?!bar)');
      expect(compiled.toRegExp().test('foobaz')).toBe(true);
      expect(compiled.toRegExp().test('foobar')).toBe(false);
    });

    test('lookbehind (?<=x)', () => {
      // match "bar" only if preceded by "foo"
      const b = rx().lookbehind(rx().literal('foo')).literal('bar');
      const compiled = b.compile();
      expect(compiled.pattern).toBe('(?<=foo)bar');
      expect(compiled.toRegExp().test('foobar')).toBe(true);
      expect(compiled.toRegExp().test('bazbar')).toBe(false);
    });

    test('negativeLookbehind (?<!x)', () => {
      // match "bar" only if NOT preceded by "foo"
      const b = rx().negativeLookbehind(rx().literal('foo')).literal('bar');
      const compiled = b.compile();
      expect(compiled.pattern).toBe('(?<!foo)bar');
      expect(compiled.toRegExp().test('bazbar')).toBe(true);
      expect(compiled.toRegExp().test('foobar')).toBe(false);
    });

    test('lookaround nested capturing', () => {
      // Capturing groups inside lookarounds should bubble up to the main type!
      const b = rx().literal('pass=').lookahead(rx().capture('password', rx().oneOrMore(rx().wordChar())));
      
      const result = b.compile().exec('pass=secret123');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.password).toBe('secret123');
      }
      expectTypeOf(result).toMatchTypeOf<{ match: string, password: string } | null>();
    });
  });
});
