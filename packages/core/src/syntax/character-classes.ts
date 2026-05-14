import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';
import { escapeLiteral, escapeClass } from '../utils/escape';

export interface CharacterClassMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Escapes string input to match characters literally.
   * Automatically escapes characters with special regex meaning.
   */
  literal(str: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any single character except line terminators.
   * Maps to `.`.
   */
  anyChar(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any digit (0-9).
   * Maps to `\d`.
   */
  digit(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any character that is not a digit.
   * Maps to `\D`.
   */
  notDigit(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any alphanumeric character from the basic Latin alphabet, including the underscore.
   * Maps to `\w`.
   */
  wordChar(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any character that is not a word character.
   * Maps to `\W`.
   */
  notWordChar(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a single white space character.
   * Maps to `\s`.
   */
  whitespace(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a single character other than white space.
   * Maps to `\S`.
   */
  notWhitespace(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any one of the enclosed characters.
   * Maps to `[...]`.
   */
  anyOf(chars: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches anything that is not enclosed.
   * Maps to `[^...]`.
   */
  noneOf(chars: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character in the specified range.
   * Maps to `[start-end]`.
   */
  range(start: string, end: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a NUL character (U+0000).
   * Maps to `\0`.
   */
  nullChar(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a line feed.
   * Maps to `\n`.
   */
  newline(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a carriage return.
   * Maps to `\r`.
   */
  carriageReturn(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a horizontal tab.
   * Maps to `\t`.
   */
  tab(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a vertical tab (U+000B).
   * Maps to `\v`.
   */
  verticalTab(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a form feed (U+000C).
   * Maps to `\f`.
   */
  formFeed(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a control character (e.g., `\cM` for Ctrl-M).
   * Maps to `\cX`.
   */
  controlChar(char: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character by its 2-digit hexadecimal code.
   * Maps to `\xNN`.
   */
  hex(nn: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character by its 4-digit Unicode hex value.
   * Maps to `\uNNNN`.
   */
  unicodeChar(nnnn: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a Unicode code point (requires `u` or `v` flag).
   * Maps to `\u{NNNN}`.
   */
  unicodeCodePoint(nnnn: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character based on its Unicode category.
   * Maps to `\p{P}`.
   */
  unicodeProperty(prop: string): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character not in the specified Unicode category.
   * Maps to `\P{P}`.
   */
  notUnicodeProperty(prop: string): IRegexBuilder<TCaptures, TFlags>;
}

RegexBuilder.prototype.literal = function (str: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'literal', value: escapeLiteral(str) });
};

RegexBuilder.prototype.anyChar = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '.' });
};

RegexBuilder.prototype.digit = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\d' });
};

RegexBuilder.prototype.notDigit = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\D' });
};

RegexBuilder.prototype.wordChar = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\w' });
};

RegexBuilder.prototype.notWordChar = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\W' });
};

RegexBuilder.prototype.whitespace = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\s' });
};

RegexBuilder.prototype.notWhitespace = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: '\\S' });
};

RegexBuilder.prototype.anyOf = function (chars: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: `[${escapeClass(chars)}]` });
};

RegexBuilder.prototype.noneOf = function (chars: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: `[^${escapeClass(chars)}]` });
};

RegexBuilder.prototype.range = function (start: string, end: string) {
  if (start.length !== 1 || end.length !== 1) {
    throw new Error('Range boundaries must be single characters');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'class', value: `[${escapeClass(start)}-${escapeClass(end)}]` });
};

RegexBuilder.prototype.nullChar = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\0' });
};

RegexBuilder.prototype.newline = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\n' });
};

RegexBuilder.prototype.carriageReturn = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\r' });
};

RegexBuilder.prototype.tab = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\t' });
};

RegexBuilder.prototype.verticalTab = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\v' });
};

RegexBuilder.prototype.formFeed = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: '\\f' });
};

RegexBuilder.prototype.controlChar = function (char: string) {
  if (!/^[A-Za-z]$/.test(char)) {
    throw new Error('Control character must be a single letter A-Z or a-z');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'control', value: `\\c${char.toUpperCase()}` });
};

RegexBuilder.prototype.hex = function (nn: string) {
  if (!/^[0-9A-Fa-f]{2}$/.test(nn)) {
    throw new Error('Hex character must be a 2-digit hexadecimal string');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'hex', value: `\\x${nn}` });
};

RegexBuilder.prototype.unicodeChar = function (nnnn: string) {
  if (!/^[0-9A-Fa-f]{4}$/.test(nnnn)) {
    throw new Error('Unicode character must be a 4-digit hexadecimal string');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'unicode', value: `\\u${nnnn}` });
};

RegexBuilder.prototype.unicodeCodePoint = function (nnnn: string) {
  if (!/^[0-9A-Fa-f]{1,6}$/.test(nnnn)) {
    throw new Error('Unicode code point must be a 1-to-6-digit hexadecimal string');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'unicode', value: `\\u{${nnnn}}` });
};

RegexBuilder.prototype.unicodeProperty = function (prop: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'unicode', value: `\\p{${prop}}` });
};

RegexBuilder.prototype.notUnicodeProperty = function (prop: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'unicode', value: `\\P{${prop}}` });
};
