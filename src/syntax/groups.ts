import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface GroupMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Matches the nested builder pattern but does not remember the match (non-capturing group).
   * Maps to `(?:...)`.
   */
  group<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, unknown>
  >(
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the nested builder pattern and stores it as a named group.
   * Maps to `(?<Name>...)`.
   */
  capture<
    Name extends string,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, unknown>
  >(
    name: Name,
    builder: IRegexBuilder<InnerCaptures, InnerFlags>
  ): IRegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;
}

RegexBuilder.prototype.group = function (builder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({ type: 'group', prefix: '(?:', suffix: ')', children: (builder as any).chunks }) as any;
};

RegexBuilder.prototype.capture = function (name, builder) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error('Capture group name must be a valid JavaScript identifier');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (this as any)._chain({
    type: 'capture',
    prefix: `(?<${name}>`,
    suffix: ')',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (builder as any).chunks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
};
