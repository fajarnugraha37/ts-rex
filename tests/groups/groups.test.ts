import { expect, test, describe } from 'bun:test';
import { expectTypeOf } from 'expect-type';
import { rx } from '../../src/index';

describe('Groups & Backreferences', () => {
  test('group (?:x) nests AST without adding to types', () => {
    const b = rx().group(rx().literal('nested'));
    expect(b.compile().pattern).toBe('(?:nested)');
    expectTypeOf(b.compile().exec('nested')).toMatchTypeOf<{ match: string } | null>();
  });

  test('capture (?<Name>x) adds to types', () => {
    const b = rx().capture('myGroup', rx().literal('matchMe'));
    expect(b.compile().pattern).toBe('(?<myGroup>matchMe)');
    
    const result = b.compile().exec('matchMe');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.myGroup).toBe('matchMe');
    }
  });

  test('matchPrevious (\\k<Name>) backreferences captured group', () => {
    const b = rx()
      .capture('quote', rx().anyOf(`'"`))
      .capture('content', rx().oneOrMore(rx().wordChar()))
      .matchPrevious('quote');
    
    const compiled = b.compile();
    expect(compiled.pattern).toBe('(?<quote>[\'"])(?<content>(?:\\w)+)\\k<quote>');

    // Should match identical quotes
    const r1 = compiled.exec(`'hello'`);
    expect(r1).not.toBeNull();
    if (r1) {
      expect(r1.content).toBe('hello');
    }

    // Should NOT match mismatched quotes
    const r2 = compiled.exec(`'hello"`);
    expect(r2).toMatchObject({ isMatch: false, match: null });
  });
});
