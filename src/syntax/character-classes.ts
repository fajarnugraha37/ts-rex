import { RegexBuilder } from '../core/builder';
import { escapeLiteral, escapeClass } from '../utils/escape';

RegexBuilder.prototype.literal = function (str: string) {
  return this._chain({ type: 'literal', value: escapeLiteral(str) });
};

RegexBuilder.prototype.anyChar = function () {
  return this._chain({ type: 'class', value: '.' });
};

RegexBuilder.prototype.digit = function () {
  return this._chain({ type: 'class', value: '\\d' });
};

RegexBuilder.prototype.notDigit = function () {
  return this._chain({ type: 'class', value: '\\D' });
};

RegexBuilder.prototype.wordChar = function () {
  return this._chain({ type: 'class', value: '\\w' });
};

RegexBuilder.prototype.notWordChar = function () {
  return this._chain({ type: 'class', value: '\\W' });
};

RegexBuilder.prototype.whitespace = function () {
  return this._chain({ type: 'class', value: '\\s' });
};

RegexBuilder.prototype.notWhitespace = function () {
  return this._chain({ type: 'class', value: '\\S' });
};

RegexBuilder.prototype.anyOf = function (chars: string) {
  return this._chain({ type: 'class', value: `[${escapeClass(chars)}]` });
};

RegexBuilder.prototype.noneOf = function (chars: string) {
  return this._chain({ type: 'class', value: `[^${escapeClass(chars)}]` });
};

RegexBuilder.prototype.range = function (start: string, end: string) {
  if (start.length !== 1 || end.length !== 1) {
    throw new Error('Range boundaries must be single characters');
  }
  return this._chain({ type: 'class', value: `[${escapeClass(start)}-${escapeClass(end)}]` });
};

RegexBuilder.prototype.nullChar = function () {
  return this._chain({ type: 'control', value: '\\0' });
};

RegexBuilder.prototype.newline = function () {
  return this._chain({ type: 'control', value: '\\n' });
};

RegexBuilder.prototype.carriageReturn = function () {
  return this._chain({ type: 'control', value: '\\r' });
};

RegexBuilder.prototype.tab = function () {
  return this._chain({ type: 'control', value: '\\t' });
};

RegexBuilder.prototype.verticalTab = function () {
  return this._chain({ type: 'control', value: '\\v' });
};

RegexBuilder.prototype.formFeed = function () {
  return this._chain({ type: 'control', value: '\\f' });
};

RegexBuilder.prototype.controlChar = function (char: string) {
  if (!/^[A-Za-z]$/.test(char)) {
    throw new Error('Control character must be a single letter A-Z or a-z');
  }
  return this._chain({ type: 'control', value: `\\c${char.toUpperCase()}` });
};

RegexBuilder.prototype.hex = function (nn: string) {
  if (!/^[0-9A-Fa-f]{2}$/.test(nn)) {
    throw new Error('Hex character must be a 2-digit hexadecimal string');
  }
  return this._chain({ type: 'hex', value: `\\x${nn}` });
};

RegexBuilder.prototype.unicodeChar = function (nnnn: string) {
  if (!/^[0-9A-Fa-f]{4}$/.test(nnnn)) {
    throw new Error('Unicode character must be a 4-digit hexadecimal string');
  }
  return this._chain({ type: 'unicode', value: `\\u${nnnn}` });
};

RegexBuilder.prototype.unicodeCodePoint = function (nnnn: string) {
  if (!/^[0-9A-Fa-f]{1,6}$/.test(nnnn)) {
    throw new Error('Unicode code point must be a 1-to-6-digit hexadecimal string');
  }
  return this._chain({ type: 'unicode', value: `\\u{${nnnn}}` });
};

RegexBuilder.prototype.unicodeProperty = function (prop: string) {
  return this._chain({ type: 'unicode', value: `\\p{${prop}}` });
};

RegexBuilder.prototype.notUnicodeProperty = function (prop: string) {
  return this._chain({ type: 'unicode', value: `\\P{${prop}}` });
};
