import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx } from '../../src/index';

describe('Quantifiers & Deep Optionality', () => {
  test('zeroOrMore (*) applies Partial deep type', () => {
    const inner = rx().capture('name', rx().wordChar());
    const b = rx().zeroOrMore(inner);
    const compiled = b.compile();
    
    expect(compiled.pattern).toBe('(?:(?<name>\\w))*');
    
    const result = compiled.exec('a');
    expectTypeOf(result).toMatchTypeOf<{ match: string, name?: string } | null>();
  });

  test('oneOrMore (+) requires the field', () => {
    const inner = rx().capture('name', rx().wordChar());
    const b = rx().oneOrMore(inner);
    const compiled = b.compile();
    
    expect(compiled.pattern).toBe('(?:(?<name>\\w))+');
    
    const result = compiled.exec('a');
    expectTypeOf(result).toMatchTypeOf<{ match: string, name: string } | null>();
  });

  test('optional (?) applies Partial deep type', () => {
    const inner = rx().capture('name', rx().wordChar());
    const b = rx().optional(inner);
    const compiled = b.compile();
    
    expect(compiled.pattern).toBe('(?:(?<name>\\w))?');
    
    const result = compiled.exec('a');
    expectTypeOf(result).toMatchTypeOf<{ match: string, name?: string } | null>();
  });

  test('times ({n})', () => {
    const inner = rx().capture('name', rx().wordChar());
    const b = rx().times(3, inner);
    const compiled = b.compile();
    
    expect(compiled.pattern).toBe('(?:(?<name>\\w)){3}');
  });

  test('atLeast ({n,}) conditional Partial', () => {
    const inner = rx().capture('name', rx().wordChar());
    
    const b0 = rx().atLeast(0, inner);
    expectTypeOf(b0.compile().exec('')).toMatchTypeOf<{ match: string, name?: string } | null>();
    
    const b1 = rx().atLeast(1, inner);
    expectTypeOf(b1.compile().exec('a')).toMatchTypeOf<{ match: string, name: string } | null>();
  });

  test('between ({min,max}) conditional Partial', () => {
    const inner = rx().capture('name', rx().wordChar());
    
    const b0 = rx().between(0, 5, inner);
    expectTypeOf(b0.compile().exec('')).toMatchTypeOf<{ match: string, name?: string } | null>();
    
    const b1 = rx().between(1, 5, inner);
    expectTypeOf(b1.compile().exec('a')).toMatchTypeOf<{ match: string, name: string } | null>();
  });

  test('lazy (?) modifies preceding quantifier', () => {
    const b = rx().oneOrMore(rx().anyChar()).lazy().literal('end');
    const compiled = b.compile();
    
    expect(compiled.pattern).toBe('(?:.)+?end');
    expect(compiled.native.exec('123end456end')?.[0]).toBe('123end'); // Matches the first 'end' due to laziness
  });
});
