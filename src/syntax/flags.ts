import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Enables global matching (g flag).
     * Modifies the execution return type to an IterableIterator.
     */
    global(): RegexBuilder<TCaptures, Omit<TFlags, 'global'> & { global: true }>;

    /**
     * Enables case-insensitive matching (i flag).
     */
    ignoreCase(): RegexBuilder<TCaptures, Omit<TFlags, 'ignoreCase'> & { ignoreCase: true }>;

    /**
     * Enables multiline matching (m flag).
     * Causes ^ and $ to match the begin/end of each line.
     */
    multiline(): RegexBuilder<TCaptures, Omit<TFlags, 'multiline'> & { multiline: true }>;

    /**
     * Enables dotAll matching (s flag).
     * Allows . to match newline characters.
     */
    dotAll(): RegexBuilder<TCaptures, Omit<TFlags, 'dotAll'> & { dotAll: true }>;

    /**
     * Enables unicode matching (u flag).
     * Treats pattern as a sequence of Unicode code points.
     */
    unicode(): RegexBuilder<TCaptures, Omit<TFlags, 'unicode'> & { unicode: true }>;

    /**
     * Enables unicodeSets matching (v flag - ES2024).
     * Upgrades u flag. Enables set operations in char classes.
     */
    unicodeSets(): RegexBuilder<TCaptures, Omit<TFlags, 'unicodeSets'> & { unicodeSets: true }>;

    /**
     * Enables sticky matching (y flag).
     * Matches only from the index indicated by the lastIndex property.
     */
    sticky(): RegexBuilder<TCaptures, Omit<TFlags, 'sticky'> & { sticky: true }>;

    /**
     * Enables indices (d flag).
     * Adds start/end indices to the match results.
     */
    withIndices(): RegexBuilder<TCaptures, Omit<TFlags, 'hasIndices'> & { hasIndices: true }>;
  }
}

RegexBuilder.prototype.global = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, global: true });
};

RegexBuilder.prototype.ignoreCase = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, ignoreCase: true });
};

RegexBuilder.prototype.multiline = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, multiline: true });
};

RegexBuilder.prototype.dotAll = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, dotAll: true });
};

RegexBuilder.prototype.unicode = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, unicode: true });
};

RegexBuilder.prototype.unicodeSets = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, unicodeSets: true });
};

RegexBuilder.prototype.sticky = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, sticky: true });
};

RegexBuilder.prototype.withIndices = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, hasIndices: true });
};
