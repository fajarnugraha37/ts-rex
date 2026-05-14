import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface BoundaryMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Matches the beginning of the input.
   * Maps to `^`.
   */
  startOfInput(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches the end of the input.
   * Maps to `$`.
   */
  endOfInput(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a word boundary.
   * Maps to `\b`.
   */
  wordBoundary(): IRegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a non-word boundary.
   * Maps to `\B`.
   */
  nonWordBoundary(): IRegexBuilder<TCaptures, TFlags>;
}

RegexBuilder.prototype.startOfInput = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'boundary', value: '^' });
};

RegexBuilder.prototype.endOfInput = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'boundary', value: '$' });
};

RegexBuilder.prototype.wordBoundary = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'boundary', value: '\\b' });
};

RegexBuilder.prototype.nonWordBoundary = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'boundary', value: '\\B' });
};
