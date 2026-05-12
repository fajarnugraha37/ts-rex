import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx, RegexBuilder, entityKind } from '../src/index';

describe('Phase 1: Core Architecture & Nominal Typing', () => {
  test('should create a builder instance with empty state', () => {
    const builder = rx();
    expect(builder).toBeInstanceOf(RegexBuilder);
    expect(builder.chunks).toEqual([]);
    expect(builder[entityKind]).toBe('RegexBuilder');
  });

  test('immutability is preserved via _chain()', () => {
    const b1 = rx();
    const b2 = b1._chain({ type: 'literal', value: 'a' });

    // Ensure it returns a completely new instance
    expect(b1).not.toBe(b2);

    // Verify chunks are copied, not mutated
    expect(b1.chunks).toEqual([]);
    expect(b2.chunks).toEqual([{ type: 'literal', value: 'a' }]);

    // Check types
    expectTypeOf(b1).toEqualTypeOf<RegexBuilder<Record<string, never>, Record<string, never>>>();
    expectTypeOf(b2).toEqualTypeOf<RegexBuilder<Record<string, never>, Record<string, never>>>();
  });

  test('phantom properties exist only at type level', () => {
    const builder = rx();
    // At runtime, the property should be undefined since it is only declared
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((builder as any)._).toBeUndefined();
  });

  test('type branding works', () => {
    const builder = rx();
    expectTypeOf(builder[entityKind]).toEqualTypeOf<'RegexBuilder'>();
  });
});
