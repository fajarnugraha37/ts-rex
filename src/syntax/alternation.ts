import { RegexBuilder, type DefaultCaptures } from '../core/builder';

declare module '../core/builder' {
  interface RegexBuilder<TCaptures, TFlags> {
    /**
     * Matches either the pattern built so far OR the passed builder pattern.
     * Maps to `(?:...|...)`.
     * Calculates the union of captures from both branches, representing mutual exclusivity.
     */
    or<OtherCaptures extends Record<string, any>, OtherFlags extends Record<string, any>>(
      builder: RegexBuilder<OtherCaptures, OtherFlags>
    ): RegexBuilder<
      (TCaptures extends DefaultCaptures ? DefaultCaptures : Partial<TCaptures>) &
      (OtherCaptures extends DefaultCaptures ? DefaultCaptures : Partial<OtherCaptures>),
      TFlags
    >;
  }
}

RegexBuilder.prototype.or = function <
  OtherCaptures extends Record<string, any>,
  OtherFlags extends Record<string, any>
>(builder: RegexBuilder<OtherCaptures, OtherFlags>) {
  // b1.or(b2) -> (?: b1 | b2 )
  return new RegexBuilder([
    {
      type: 'or',
      prefix: '(?:',
      suffix: ')',
      children: [
        { type: 'branch', children: this.chunks },
        { type: 'branch', prefix: '|', children: builder.chunks },
      ],
    },
  ]) as unknown as RegexBuilder<any, any>;
};
