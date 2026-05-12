import { expect, test, describe } from 'bun:test';
import { rx } from '../../src/index';

describe('Assertions & Boundaries', () => {
  test('startOfInput (^)', () => {
    const b = rx().startOfInput().literal('A').compile().native;
    expect(b.test('A')).toBe(true);
    expect(b.test(' B A')).toBe(false);
  });

  test('endOfInput ($)', () => {
    const b = rx().literal('A').endOfInput().compile().native;
    expect(b.test('A')).toBe(true);
    expect(b.test('A B')).toBe(false);
  });

  test('wordBoundary (\\b)', () => {
    const b = rx().wordBoundary().literal('test').wordBoundary().compile().native;
    expect(b.test('this is a test')).toBe(true);
    expect(b.test('testing')).toBe(false);
  });

  test('nonWordBoundary (\\B)', () => {
    const compiled = rx().literal('test').nonWordBoundary().compile();
    const result = compiled.exec('testing');
    expect(result?.match).toBe(true);
    expect(compiled.native.test('this is a test')).toBe(false);
  });
});
