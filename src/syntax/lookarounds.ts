import { RegexBuilder } from '../core/builder';

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
