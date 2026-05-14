import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface FlagMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Enables global matching.
   * Modifies the execution return type to an IterableIterator.
   */
  global(): IRegexBuilder<TCaptures, Omit<TFlags, 'global'> & { global: true }>;

  /**
   * Enables case-insensitive matching (i flag).
   */
  ignoreCase(): IRegexBuilder<
    TCaptures,
    Omit<TFlags, 'ignoreCase'> & { ignoreCase: true }
  >;

  /**
   * Enables multiline matching (m flag).
   * Causes ^ and $ to match the begin/end of each line.
   */
  multiline(): IRegexBuilder<
    TCaptures,
    Omit<TFlags, 'multiline'> & { multiline: true }
  >;

  /**
   * Enables dotAll matching (s flag).
   * Allows . to match newline characters.
   */
  dotAll(): IRegexBuilder<TCaptures, Omit<TFlags, 'dotAll'> & { dotAll: true }>;

  /**
   * Enables unicode matching (u flag).
   * Treats pattern as a sequence of Unicode code points.
   */
  unicode(): IRegexBuilder<TCaptures, Omit<TFlags, 'unicode'> & { unicode: true }>;

  /**
   * Enables unicodeSets matching (v flag - ES2024).
   * Upgrades u flag. Enables set operations in char classes.
   */
  unicodeSets(): IRegexBuilder<
    TCaptures,
    Omit<TFlags, 'unicodeSets'> & { unicodeSets: true }
  >;

  /**
   * Enables sticky matching (y flag).
   * Matches only from the index indicated by the lastIndex property.
   */
  sticky(): IRegexBuilder<TCaptures, Omit<TFlags, 'sticky'> & { sticky: true }>;

  /**
   * Enables indices (d flag).
   * Adds start/end indices to the match results.
   */
  withIndices(): IRegexBuilder<
    TCaptures,
    Omit<TFlags, 'hasIndices'> & { hasIndices: true }
  >;
}

RegexBuilder.prototype.global = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, global: true }) as any;
};

RegexBuilder.prototype.ignoreCase = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, ignoreCase: true }) as any;
};

RegexBuilder.prototype.multiline = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, multiline: true }) as any;
};

RegexBuilder.prototype.dotAll = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, dotAll: true }) as any;
};

RegexBuilder.prototype.unicode = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, unicode: true }) as any;
};

RegexBuilder.prototype.unicodeSets = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, unicodeSets: true }) as any;
};

RegexBuilder.prototype.sticky = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, sticky: true }) as any;
};

RegexBuilder.prototype.withIndices = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder((this as any).chunks, { ...(this as any)._flags, hasIndices: true }) as any;
};
