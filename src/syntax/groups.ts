import { RegexBuilder } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches the nested builder pattern but does not remember the match (non-capturing group).
     * Maps to `(?:...)`.
     */
    group<InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, unknown>>(
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

    /**
     * Matches the nested builder pattern and stores it as a named group.
     * Maps to `(?<Name>...)`.
     */
    capture<Name extends string, InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, unknown>>(
      name: Name,
      builder: RegexBuilder<InnerCaptures, InnerFlags>
    ): RegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;
  }
}

RegexBuilder.prototype.group = function <
  InnerCaptures extends Record<string, unknown>,
  InnerFlags extends Record<string, unknown>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({ type: 'group', prefix: '(?:', suffix: ')', children: builder.chunks });
};

RegexBuilder.prototype.capture = function <
  Name extends string,
  InnerCaptures extends Record<string, unknown>,
  InnerFlags extends Record<string, unknown>
>(name: Name, builder: RegexBuilder<InnerCaptures, InnerFlags>) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error('Capture group name must be a valid JavaScript identifier');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return this._chain<any, any>({
    type: 'capture',
    prefix: `(?<${name}>`,
    suffix: ')',
    children: builder.chunks,
  });
};
