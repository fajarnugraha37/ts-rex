import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.global = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, global: true });
};

RegexBuilder.prototype.ignoreCase = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, ignoreCase: true });
};

RegexBuilder.prototype.multiline = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, multiline: true });
};

RegexBuilder.prototype.dotAll = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, dotAll: true });
};

RegexBuilder.prototype.unicode = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, unicode: true });
};

RegexBuilder.prototype.unicodeSets = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, unicodeSets: true });
};

RegexBuilder.prototype.sticky = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, sticky: true });
};

RegexBuilder.prototype.withIndices = function () {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new RegexBuilder<any, any>(this.chunks, { ...this._flags, hasIndices: true });
};
