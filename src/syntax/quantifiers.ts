import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.zeroOrMore = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')*',
    children: builder.chunks,
  });
};

RegexBuilder.prototype.oneOrMore = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')+',
    children: builder.chunks,
  });
};

RegexBuilder.prototype.optional = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')?',
    children: builder.chunks,
  });
};

RegexBuilder.prototype.times = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  n: number,
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "times" expects a positive integer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n}}`,
    children: builder.chunks,
  });
};

RegexBuilder.prototype.atLeast = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  n: number,
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "atLeast" expects a positive integer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n},}`,
    children: builder.chunks,
  });
};

RegexBuilder.prototype.between = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  min: number,
  max: number,
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  if (min < 0 || !Number.isInteger(min) || max < 0 || !Number.isInteger(max) || min > max) {
    throw new Error('Quantifier "between" expects min <= max and both positive integers');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${min},${max}}`,
    children: builder.chunks,
  });
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(newChunks, this._flags);
};
