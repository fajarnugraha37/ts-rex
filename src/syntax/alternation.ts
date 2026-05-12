import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.or = function <
  OtherCaptures extends Record<string, unknown>,
  OtherFlags extends Record<string, unknown>
>(builder: RegexBuilder<OtherCaptures, OtherFlags>) {
  // b1.or(b2) -> (?: b1 | b2 )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>([
    {
      type: 'or',
      prefix: '(?:',
      suffix: ')',
      children: [
        { type: 'branch', children: this.chunks },
        { type: 'branch', prefix: '|', children: builder.chunks },
      ],
    },
  ]);
};
