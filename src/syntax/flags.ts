import { RegexBuilder } from '../core/builder';

RegexBuilder.prototype.global = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, global: true }) as any;
};

RegexBuilder.prototype.ignoreCase = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, ignoreCase: true }) as any;
};

RegexBuilder.prototype.multiline = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, multiline: true }) as any;
};

RegexBuilder.prototype.dotAll = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, dotAll: true }) as any;
};

RegexBuilder.prototype.unicode = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, unicode: true }) as any;
};

RegexBuilder.prototype.unicodeSets = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, unicodeSets: true }) as any;
};

RegexBuilder.prototype.sticky = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, sticky: true }) as any;
};

RegexBuilder.prototype.withIndices = function () {
  return new RegexBuilder(this.chunks, { ...this._flags, hasIndices: true }) as any;
};
