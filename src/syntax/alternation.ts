import { RegexBuilder } from '../core/builder';
import type { RegexBuilder as IRegexBuilder } from '../core/types';

export interface AlternationMethods<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Matches either the pattern built so far OR the passed builder pattern.
   * Maps to `(?:...|...)`.
   * Calculates the union of captures from both branches, representing mutual exclusivity.
   */
  or<
    OtherCaptures extends Record<string, unknown>,
    OtherFlags extends Record<string, unknown>
  >(
    builder: IRegexBuilder<OtherCaptures, OtherFlags>
  ): IRegexBuilder<Partial<TCaptures> & Partial<OtherCaptures>, TFlags>;
}

RegexBuilder.prototype.or = function (builder) {
  // b1.or(b2) -> (?: b1 | b2 )
  return new RegexBuilder(
    [
      {
        type: 'or',
        prefix: '(?:',
        suffix: ')',
        children: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { type: 'branch', children: (this as any).chunks },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { type: 'branch', prefix: '|', children: (builder as any).chunks },
        ],
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._flags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
};
