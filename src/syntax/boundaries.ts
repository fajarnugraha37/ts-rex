import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches the beginning of the input.
     * Maps to `^`.
     */
    startOfInput(): RegexBuilder<TCaptures, TFlags>;

    /**
     * Matches the end of the input.
     * Maps to `$`.
     */
    endOfInput(): RegexBuilder<TCaptures, TFlags>;

    /**
     * Matches a word boundary.
     * Maps to `\b`.
     */
    wordBoundary(): RegexBuilder<TCaptures, TFlags>;

    /**
     * Matches a non-word boundary.
     * Maps to `\B`.
     */
    nonWordBoundary(): RegexBuilder<TCaptures, TFlags>;
  }
}

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
