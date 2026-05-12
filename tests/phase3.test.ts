import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx, RegexBuilder } from '../src/index';

describe('Phase 3: Grouping, Quantifiers & Alternation', () => {
  describe('Grouping', () => {
    test('non-capturing group', () => {
      const b = rx().group(rx().literal('a'));
      expect(b.compile().pattern).toBe('(?:a)');
      expectTypeOf(b).toEqualTypeOf<RegexBuilder<Record<string, never>, Record<string, never>>>();
    });

    test('named capturing group', () => {
      const b = rx().capture('myGroup', rx().literal('a'));
      expect(b.compile().pattern).toBe('(?<myGroup>a)');
      expectTypeOf(b).toEqualTypeOf<
        RegexBuilder<Record<string, never> & Record<'myGroup', string> & Record<string, never>, Record<string, never>>
      >();
    });

    test('nested capturing groups', () => {
      const b = rx().capture('outer', rx().literal('a').capture('inner', rx().literal('b')));
      expect(b.compile().pattern).toBe('(?<outer>a(?<inner>b))');
      
      // Checking that both groups are present in the type
      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ outer: string; inner: string }>();
    });

    test('capture throws on invalid name', () => {
      expect(() => rx().capture('1invalid', rx().anyChar())).toThrow();
    });
  });

  describe('Quantifiers', () => {
    test('zeroOrMore', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().zeroOrMore(inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a))*');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a?: string }>();
    });

    test('oneOrMore', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().oneOrMore(inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a))+');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a: string }>();
    });

    test('optional', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().optional(inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a))?');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a?: string }>();
    });

    test('times', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().times(3, inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a)){3}');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a: string }>();
    });

    test('atLeast', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().atLeast(2, inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a)){2,}');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a: string }>();

      const bZero = rx().atLeast(0, inner);
      type CapturesZero = typeof bZero extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<CapturesZero>().toMatchTypeOf<{ a?: string }>();
    });

    test('between', () => {
      const inner = rx().capture('a', rx().literal('a'));
      const b = rx().between(1, 3, inner);
      expect(b.compile().pattern).toBe('(?:(?<a>a)){1,3}');

      type Captures = typeof b extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<Captures>().toMatchTypeOf<{ a: string }>();

      const bZero = rx().between(0, 3, inner);
      type CapturesZero = typeof bZero extends RegexBuilder<infer C, any> ? C : never;
      expectTypeOf<CapturesZero>().toMatchTypeOf<{ a?: string }>();
    });

    test('lazy', () => {
      const b = rx().zeroOrMore(rx().literal('a')).lazy();
      expect(b.compile().pattern).toBe('(?:a)*?');
    });

    test('lazy throws on empty builder', () => {
      expect(() => rx().lazy()).toThrow();
    });
  });

  describe('Alternation', () => {
    test('or operation builds correct pattern', () => {
      const b = rx().literal('a').or(rx().literal('b'));
      expect(b.compile().pattern).toBe('(?:a|b)');
    });

    test('or operation merges types (Mutual Exclusivity)', () => {
      const branchA = rx().capture('a', rx().literal('a'));
      const branchB = rx().capture('b', rx().literal('b'));
      const combined = branchA.or(branchB);
      
      expect(combined.compile().pattern).toBe('(?:(?<a>a)|(?<b>b))');

      type Captures = typeof combined extends RegexBuilder<infer C, any> ? C : never;
      // Because either a OR b matches, both could be undefined in the final record.
      expectTypeOf<Captures>().toMatchTypeOf<{ a?: string; b?: string }>();
    });
  });

  describe('Lookarounds & Backreferences', () => {
    test('lookahead', () => {
      const b = rx().lookahead(rx().literal('a'));
      expect(b.compile().pattern).toBe('(?=a)');
    });

    test('negativeLookahead', () => {
      const b = rx().negativeLookahead(rx().literal('a'));
      expect(b.compile().pattern).toBe('(?!a)');
    });

    test('lookbehind', () => {
      const b = rx().lookbehind(rx().literal('a'));
      expect(b.compile().pattern).toBe('(?<=a)');
    });

    test('negativeLookbehind', () => {
      const b = rx().negativeLookbehind(rx().literal('a'));
      expect(b.compile().pattern).toBe('(?<!a)');
    });

    test('matchPrevious (backreference)', () => {
      const b = rx().capture('myGroup', rx().literal('a')).matchPrevious('myGroup');
      expect(b.compile().pattern).toBe('(?<myGroup>a)\\k<myGroup>');
      
      // Testing type constraint (uncommenting below should cause TS error)
      // rx().capture('myGroup', rx().literal('a')).matchPrevious('invalidGroup');
    });
  });
});
