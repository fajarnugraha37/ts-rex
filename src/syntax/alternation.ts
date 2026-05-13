import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.or = function (builder) {
  // b1.or(b2) -> (?: b1 | b2 )
  return new RegexBuilder(
    [
      {
        type: 'or',
        prefix: '(?:',
        suffix: ')',
        children: [
          { type: 'branch', children: this.chunks },
          { type: 'branch', prefix: '|', children: builder.chunks },
        ],
      },
    ],
    this._flags
  ) as any;
};
