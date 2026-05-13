import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface LookaroundMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Matches only if the current position is followed by the passed pattern.
   * Maps to `(?=...)`.
   */
  lookahead<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is not followed by the passed pattern.
   * Maps to `(?!...)`.
   */
  negativeLookahead<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is preceded by the passed pattern.
   * Maps to `(?<=...)`.
   */
  lookbehind<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is not preceded by the passed pattern.
   * Maps to `(?<!...)`.
   */
  negativeLookbehind<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches exact text captured by a previously named group.
   * Maps to `\k<name>`.
   */
  matchPrevious<Name extends keyof TCaptures & string>(
    name: Name
  ): IRegexBuilder<TCaptures, TFlags>;
}

RegexBuilder.prototype.lookahead = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'lookahead', prefix: '(?=', suffix: ')', children: (builder as any).chunks }) as any;
};

RegexBuilder.prototype.negativeLookahead = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'negativeLookahead', prefix: '(?!', suffix: ')', children: (builder as any).chunks }) as any;
};

RegexBuilder.prototype.lookbehind = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'lookbehind', prefix: '(?<=', suffix: ')', children: (builder as any).chunks }) as any;
};

RegexBuilder.prototype.negativeLookbehind = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'negativeLookbehind', prefix: '(?<!', suffix: ')', children: (builder as any).chunks }) as any;
};

RegexBuilder.prototype.matchPrevious = function (name) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'backreference', value: `\\k<${name as string}>` }) as any;
};
