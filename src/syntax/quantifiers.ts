import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches the wrapped pattern 0 or more times.
     * Maps to `(?:...)*`.
     * At the type level, marks all inner captures as optional.
     */
    zeroOrMore<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

    /**
     * Matches the wrapped pattern 1 or more times.
     * Maps to `(?:...)+`.
     */
    oneOrMore<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches the wrapped pattern 0 or 1 times (optional).
     * Maps to `(?:...)?`.
     * At the type level, marks all inner captures as optional.
     */
    optional<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

    /**
     * Matches the wrapped pattern exactly "n" occurrences.
     * Maps to `(?:...){n}`.
     */
    times<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      n: number,
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches the wrapped pattern at least "n" occurrences.
     * Maps to `(?:...){n,}`.
     * At the type level, if n = 0, inner captures are marked optional.
     */
    atLeast<N extends number, InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      n: N,
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & (N extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>;

    /**
     * Matches the wrapped pattern between "min" and "max" occurrences.
     * Maps to `(?:...){min,max}`.
     * At the type level, if min = 0, inner captures are marked optional.
     */
    between<Min extends number, InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      min: Min,
      max: number,
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & (Min extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>;

    /**
     * Modifies the preceding quantifier to match the minimum number of times (lazy/non-greedy).
     * Appends `?` to the previous quantifier chunk.
     */
    lazy(): RegexBuilder<TCaptures, TFlags>;
  }
}

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
