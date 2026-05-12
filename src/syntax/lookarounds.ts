import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches only if the current position is followed by the passed pattern.
     * Maps to `(?=...)`.
     */
    lookahead<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches only if the current position is not followed by the passed pattern.
     * Maps to `(?!...)`.
     */
    negativeLookahead<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches only if the current position is preceded by the passed pattern.
     * Maps to `(?<=...)`.
     */
    lookbehind<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches only if the current position is not preceded by the passed pattern.
     * Maps to `(?<!...)`.
     */
    negativeLookbehind<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches exact text captured by a previously named group.
     * Maps to `\k<name>`.
     */
    matchPrevious<Name extends keyof TCaptures>(
      name: Name
    ): RegexBuilder<TCaptures, TFlags>;
  }
}

RegexBuilder.prototype.lookahead = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'lookahead', prefix: '(?=', suffix: ')', children: builder.chunks });
};

RegexBuilder.prototype.negativeLookahead = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'negativeLookahead', prefix: '(?!', suffix: ')', children: builder.chunks });
};

RegexBuilder.prototype.lookbehind = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'lookbehind', prefix: '(?<=', suffix: ')', children: builder.chunks });
};

RegexBuilder.prototype.negativeLookbehind = function <InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'negativeLookbehind', prefix: '(?<!', suffix: ')', children: builder.chunks });
};

RegexBuilder.prototype.matchPrevious = function <Name extends PropertyKey>(
  name: Name
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'backreference', value: `\\k<${name as string}>` });
};
