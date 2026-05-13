import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.zeroOrMore = function (builder) {
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')*',
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.oneOrMore = function (builder) {
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')+',
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.optional = function (builder) {
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')?',
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.times = function (n, builder) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "times" expects a positive integer');
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n}}`,
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.atLeast = function (n, builder) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "atLeast" expects a positive integer');
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n},}`,
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.between = function (min, max, builder) {
  if (min < 0 || !Number.isInteger(min) || max < 0 || !Number.isInteger(max) || min > max) {
    throw new Error('Quantifier "between" expects min <= max and both positive integers');
  }
  return this._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${min},${max}}`,
    children: builder.chunks,
  }) as any;
};

RegexBuilder.prototype.lazy = function () {
  if (this.chunks.length === 0) {
    throw new Error('Cannot apply .lazy() to an empty builder');
  }
  const lastChunk = this.chunks[this.chunks.length - 1];
  if (!lastChunk || lastChunk.type !== 'quantifier') {
    throw new Error('.lazy() can only be applied immediately after a quantifier');
  }

  const newLastChunk = { ...lastChunk, suffix: (lastChunk.suffix || '') + '?' };
  const newChunks = this.chunks.slice(0, -1).concat(newLastChunk);
  
  return new RegexBuilder(newChunks, this._flags) as any;
};
