import { RegexBuilder } from '../core/builder';

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
