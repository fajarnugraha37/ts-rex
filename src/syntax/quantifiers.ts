import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface QuantifierMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Matches the wrapped pattern 0 or more times.
   * Maps to `(?:...)*`.
   * At the type level, marks all inner captures as optional.
   */
  zeroOrMore<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

  /**
   * Matches the wrapped pattern 1 or more times.
   * Maps to `(?:...)+`.
   */
  oneOrMore<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the wrapped pattern 0 or 1 times (optional).
   * Maps to `(?:...)?`.
   * At the type level, marks all inner captures as optional.
   */
  optional<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

  /**
   * Matches the wrapped pattern exactly "n" occurrences.
   * Maps to `(?:...){n}`.
   */
  times<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    n: number,
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the wrapped pattern at least "n" occurrences.
   * Maps to `(?:...){n,}`.
   * At the type level, if n = 0, inner captures are marked optional.
   */
  atLeast<
    N extends number,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    n: N,
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<
    TCaptures & (N extends 0 ? Partial<InnerCaptures> : InnerCaptures),
    TFlags
  >;

  /**
   * Matches the wrapped pattern between "min" and "max" occurrences.
   * Maps to `(?:...){min,max}`.
   * At the type level, if min = 0, inner captures are marked optional.
   */
  between<
    Min extends number,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    min: Min,
    max: number,
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<
    TCaptures & (Min extends 0 ? Partial<InnerCaptures> : InnerCaptures),
    TFlags
  >;

  /**
   * Modifies the preceding quantifier to match the minimum number of times (lazy/non-greedy).
   * Appends `?` to the previous quantifier chunk.
   */
  lazy(): IRegexBuilder<TCaptures, TFlags>;
}

RegexBuilder.prototype.zeroOrMore = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')*',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.oneOrMore = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')+',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.optional = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: ')?',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.times = function (n, builder) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "times" expects a positive integer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n}}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.atLeast = function (n, builder) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Quantifier "atLeast" expects a positive integer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${n},}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.between = function (min, max, builder) {
  if (min < 0 || !Number.isInteger(min) || max < 0 || !Number.isInteger(max) || min > max) {
    throw new Error('Quantifier "between" expects min <= max and both positive integers');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'quantifier',
    prefix: '(?:',
    suffix: `){${min},${max}}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};

RegexBuilder.prototype.lazy = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((this as any).chunks.length === 0) {
    throw new Error('Cannot apply .lazy() to an empty builder');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastChunk = (this as any).chunks[(this as any).chunks.length - 1];
  if (!lastChunk || lastChunk.type !== 'quantifier') {
    throw new Error('.lazy() can only be applied immediately after a quantifier');
  }

  const newLastChunk = { ...lastChunk, suffix: (lastChunk.suffix || '') + '?' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newChunks = (this as any).chunks.slice(0, -1).concat(newLastChunk);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder(newChunks, (this as any)._flags) as any;
};
