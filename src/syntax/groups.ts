import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.group = function (builder) {
  return this._chain({ type: 'group', prefix: '(?:', suffix: ')', children: builder.chunks }) as any;
};

RegexBuilder.prototype.capture = function (name, builder) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error('Capture group name must be a valid JavaScript identifier');
  }
  return this._chain({
    type: 'capture',
    prefix: `(?<${name}>`,
    suffix: ')',
    children: builder.chunks,
  }) as any;
};
