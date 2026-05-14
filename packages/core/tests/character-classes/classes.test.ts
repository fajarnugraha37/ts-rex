import { expect, test, describe } from 'bun:test';
import { rx } from '../../src/index';

describe('Character Classes & Control Characters', () => {
  test('anyChar (.)', () => {
    const b = rx().anyChar().compile().toRegExp();
    expect(b.test('a')).toBe(true);
    expect(b.test('1')).toBe(true);
    expect(b.test('\n')).toBe(false); // without dotAll
  });

  test('digit (\\d) & notDigit (\\D)', () => {
    const d = rx().digit().compile().toRegExp();
    expect(d.test('5')).toBe(true);
    expect(d.test('a')).toBe(false);

    const D = rx().notDigit().compile().toRegExp();
    expect(D.test('a')).toBe(true);
    expect(D.test('5')).toBe(false);
  });

  test('wordChar (\\w) & notWordChar (\\W)', () => {
    const w = rx().wordChar().compile().toRegExp();
    expect(w.test('a')).toBe(true);
    expect(w.test('_')).toBe(true);
    expect(w.test('!')).toBe(false);

    const W = rx().notWordChar().compile().toRegExp();
    expect(W.test('!')).toBe(true);
    expect(W.test('a')).toBe(false);
  });

  test('whitespace (\\s) & notWhitespace (\\S)', () => {
    const s = rx().whitespace().compile().toRegExp();
    expect(s.test(' ')).toBe(true);
    expect(s.test('\t')).toBe(true);
    expect(s.test('a')).toBe(false);

    const S = rx().notWhitespace().compile().toRegExp();
    expect(S.test('a')).toBe(true);
    expect(S.test(' ')).toBe(false);
  });

  test('anyOf ([...]) and noneOf ([^...])', () => {
    const any = rx().anyOf('a-c').compile().toRegExp();
    // escape checks: 'a-c' -> 'a\-c' so it matches a, -, c literally, not a range!
    expect(any.test('a')).toBe(true);
    expect(any.test('-')).toBe(true);
    expect(any.test('b')).toBe(false); 

    const none = rx().noneOf('a').compile().toRegExp();
    expect(none.test('b')).toBe(true);
    expect(none.test('a')).toBe(false);
  });

  test('range ([x-y])', () => {
    const r = rx().range('a', 'z').compile().toRegExp();
    expect(r.test('m')).toBe(true);
    expect(r.test('A')).toBe(false);
    expect(r.test('1')).toBe(false);
  });

  test('control characters (\\n, \\t, etc)', () => {
    const c = rx().newline().tab().carriageReturn().nullChar().verticalTab().formFeed().compile().toRegExp();
    expect(c.test('\n\t\r\0\v\f')).toBe(true);
  });

  test('controlChar (\\cX)', () => {
    const c = rx().controlChar('M').compile().toRegExp();
    // Ctrl-M is carriage return
    expect(c.test('\r')).toBe(true);
  });

  test('hex (\\xNN)', () => {
    const h = rx().hex('41').compile().toRegExp(); // 41 is 'A'
    expect(h.test('A')).toBe(true);
  });

  test('unicodeChar (\\uNNNN)', () => {
    const u = rx().unicodeChar('0041').compile().toRegExp(); // 0041 is 'A'
    expect(u.test('A')).toBe(true);
  });

  test('unicodeCodePoint (\\u{NNNN})', () => {
    const u = rx().unicodeCodePoint('1F600').unicode().compile().toRegExp(); // 😀 requires u flag
    expect(u.test('😀')).toBe(true);
  });

  test('unicodeProperty (\\p{P})', () => {
    const u = rx().unicodeProperty('Letter').unicode().compile().toRegExp();
    expect(u.test('a')).toBe(true);
    expect(u.test('1')).toBe(false);

    const P = rx().notUnicodeProperty('Letter').unicode().compile().toRegExp();
    expect(P.test('1')).toBe(true);
    expect(P.test('a')).toBe(false);
  });
});
