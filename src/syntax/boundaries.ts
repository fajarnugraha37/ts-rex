import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.startOfInput = function () {
  return this._chain({ type: 'boundary', value: '^' });
};

RegexBuilder.prototype.endOfInput = function () {
  return this._chain({ type: 'boundary', value: '$' });
};

RegexBuilder.prototype.wordBoundary = function () {
  return this._chain({ type: 'boundary', value: '\\b' });
};

RegexBuilder.prototype.nonWordBoundary = function () {
  return this._chain({ type: 'boundary', value: '\\B' });
};
