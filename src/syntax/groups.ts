import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches the nested builder pattern but does not remember the match (non-capturing group).
     * Maps to `(?:...)`.
     */
    group<InnerCaptures extends Record<string, any>, InnerFlags extends Record<string, boolean>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches the nested builder pattern and stores it as a named group.
     * Maps to `(?<Name>...)`.
     */
    capture<Name extends string, InnerCaptures extends Record<string, any>, InnerFlags extends Record<string, boolean>>(
      name: Name,
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;
  }
}

RegexBuilder.prototype.group = function <
  InnerCaptures extends Record<string, any>,
  InnerFlags extends Record<string, boolean>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>) {
  return this._chain({ type: 'group', prefix: '(?:', suffix: ')', children: builder.chunks }) as unknown as RegexBuilder<any, any>;
};

RegexBuilder.prototype.capture = function <
  Name extends string,
  InnerCaptures extends Record<string, any>,
  InnerFlags extends Record<string, boolean>
>(name: Name, builder: RegexBuilder<InnerCaptures, InnerFlags>) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error('Capture group name must be a valid JavaScript identifier');
  }
  return this._chain({
    type: 'capture',
    prefix: `(?<${name}>`,
    suffix: ')',
    children: builder.chunks,
  }) as unknown as RegexBuilder<any, any>;
};
