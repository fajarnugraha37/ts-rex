import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.lookahead = function (builder) {
  return this._chain({ type: 'lookahead', prefix: '(?=', suffix: ')', children: builder.chunks }) as any;
};

RegexBuilder.prototype.negativeLookahead = function (builder) {
  return this._chain({ type: 'negativeLookahead', prefix: '(?!', suffix: ')', children: builder.chunks }) as any;
};

RegexBuilder.prototype.lookbehind = function (builder) {
  return this._chain({ type: 'lookbehind', prefix: '(?<=', suffix: ')', children: builder.chunks }) as any;
};

RegexBuilder.prototype.negativeLookbehind = function (builder) {
  return this._chain({ type: 'negativeLookbehind', prefix: '(?<!', suffix: ')', children: builder.chunks }) as any;
};

RegexBuilder.prototype.matchPrevious = function (name) {
  return this._chain({ type: 'backreference', value: `\\k<${name as string}>` }) as any;
};
