import { expect, test, describe } from 'bun:test';
import { rx } from '../src/index';

describe('Phase 2: Core Syntax, Boundaries & Escapes', () => {
  describe('Literal Escaping', () => {
    test('should escape special regex characters in literal', () => {
      const pattern = rx().literal('.*+?^${}()|[]\\').compile().pattern;
      expect(pattern).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    test('should not escape normal characters', () => {
      const pattern = rx().literal('hello123').compile().pattern;
      expect(pattern).toBe('hello123');
    });
  });

  describe('Character Classes', () => {
    test('should generate correct pattern for standard classes', () => {
      const pattern = rx()
        .anyChar()
        .digit()
        .notDigit()
        .wordChar()
        .notWordChar()
        .whitespace()
        .notWhitespace()
        .compile().pattern;
      
      expect(pattern).toBe('.\\d\\D\\w\\W\\s\\S');
    });

    test('should properly escape characters inside anyOf and noneOf', () => {
      const pattern1 = rx().anyOf('a-z^]\\').compile().pattern;
      expect(pattern1).toBe('[a\\-z\\^\\]\\\\]');

      const pattern2 = rx().noneOf('a-z^]\\').compile().pattern;
      expect(pattern2).toBe('[^a\\-z\\^\\]\\\\]');
    });

    test('should generate range', () => {
      const pattern = rx().range('a', 'z').compile().pattern;
      expect(pattern).toBe('[a-z]');
    });

    test('range should throw if multi-character', () => {
      expect(() => rx().range('ab', 'z')).toThrow();
    });
  });

  describe('Control Characters', () => {
    test('should generate correct pattern for control characters', () => {
      const pattern = rx()
        .nullChar()
        .newline()
        .carriageReturn()
        .tab()
        .verticalTab()
        .formFeed()
        .compile().pattern;
      expect(pattern).toBe('\\0\\n\\r\\t\\v\\f');
    });

    test('should support controlChar(X)', () => {
      const pattern = rx().controlChar('M').compile().pattern;
      expect(pattern).toBe('\\cM');

      const patternCase = rx().controlChar('m').compile().pattern;
      expect(patternCase).toBe('\\cM');
    });

    test('controlChar should throw if invalid', () => {
      expect(() => rx().controlChar('1')).toThrow();
      expect(() => rx().controlChar('MM')).toThrow();
    });
  });

  describe('Hex & Unicode', () => {
    test('should generate correct hex and unicode patterns', () => {
      const pattern = rx()
        .hex('4A')
        .unicodeChar('004A')
        .unicodeCodePoint('1F600')
        .unicodeProperty('Emoji')
        .notUnicodeProperty('White_Space')
        .compile().pattern;
      
      expect(pattern).toBe('\\x4A\\u004A\\u{1F600}\\p{Emoji}\\P{White_Space}');
    });

    test('hex/unicode should throw if invalid format', () => {
      expect(() => rx().hex('GZ')).toThrow();
      expect(() => rx().unicodeChar('123')).toThrow();
      expect(() => rx().unicodeCodePoint('1234567')).toThrow();
    });
  });

  describe('Boundaries', () => {
    test('should generate boundary patterns', () => {
      const pattern = rx()
        .startOfInput()
        .wordBoundary()
        .literal('test')
        .nonWordBoundary()
        .endOfInput()
        .compile().pattern;

      expect(pattern).toBe('^\\btest\\B$');
    });
  });

  describe('Power User Escape Hatches', () => {
    test('raw() injects exact string without escaping', () => {
      const pattern = rx().raw('(?<custom>a|b)+').compile().pattern;
      expect(pattern).toBe('(?<custom>a|b)+');
    });

    test('rawClass() injects exact string wrapped in brackets without escaping', () => {
      const pattern = rx().rawClass('a-zA-Z0-9.-').compile().pattern;
      expect(pattern).toBe('[a-zA-Z0-9.-]');
    });
  });

  describe('Execution Output', () => {
    test('should actually compile to a valid RegExp', () => {
      const reg = rx()
        .startOfInput()
        .literal('hello')
        .whitespace()
        .digit()
        .compile()
        .toRegExp();
      
      expect(reg.test('hello 5')).toBe(true);
      expect(reg.test('hello ')).toBe(false);
    });
  });
});
