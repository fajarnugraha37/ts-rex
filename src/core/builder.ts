import { entityKind } from './types';
import type { 
  ASTNode, 
  DefaultCaptures, 
  DefaultFlags, 
  CompiledRegex, 
  RegexBuilder as IRegexBuilder
} from './types';

/**
 * The core builder class for constructing type-safe regular expressions.
 * Use the {@link rx} function to create a new instance.
 * 
 * @typeParam TCaptures - A record of named capture groups inferred from the builder.
 * @typeParam TFlags - A record of regex flags currently enabled.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegexBuilder<
  TCaptures extends Record<string, unknown> = DefaultCaptures,
  TFlags extends Record<string, unknown> = DefaultFlags
> extends IRegexBuilder<TCaptures, TFlags> {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class RegexBuilder<
  TCaptures extends Record<string, unknown> = DefaultCaptures,
  TFlags extends Record<string, unknown> = DefaultFlags
> {
  /**
   * Phantom properties to carry type information at compile time
   * without incurring runtime memory overhead.
   */
  declare readonly _: {
    readonly captures: TCaptures;
    readonly flags: TFlags;
  };

  /**
   * Nominal type branding to prevent structural collisions.
   */
  readonly [entityKind] = 'RegexBuilder' as const;

  constructor(
    public readonly chunks: ASTNode[] = [],
    public readonly _flags: Record<string, boolean> = {}
  ) {}

  /**
   * @internal
   * Returns a completely new instance of the builder with the appended AST node.
   * This explicitly enforces the immutability architectural pillar.
   */
  _chain<
    NewCaptures extends Record<string, unknown> = TCaptures,
    NewFlags extends Record<string, unknown> = TFlags
  >(chunk: ASTNode): RegexBuilder<NewCaptures, NewFlags> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new RegexBuilder<NewCaptures, NewFlags>([...this.chunks, chunk], this._flags) as any;
  }

  /**
   * **Power User Escape Hatch**: Injects the exact string into the AST without any auto-escaping protection.
   * Allows manual registration of capture groups via the generic parameter.
   * @typeParam NewCaptures - Manually specified capture groups present in the raw string.
   */
  raw<NewCaptures extends Record<string, unknown> = Record<string, never>>(
    str: string
  ): RegexBuilder<TCaptures & NewCaptures, TFlags> {
    return this._chain<TCaptures & NewCaptures, TFlags>({ type: 'raw', value: str });
  }

  /**
   * **Power User Escape Hatch**: Generates `[str]` exactly as typed without any auto-escaping protection.
   * Use this to construct complex, unescaped character ranges manually.
   * @param str The raw regex string to wrap in brackets.
   */
  rawClass(str: string): RegexBuilder<TCaptures, TFlags> {
    return this._chain({ type: 'rawClass', value: `[${str}]` });
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_addCapture<K extends string>(): RegexBuilder<TCaptures & Record<K, string>, TFlags> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new RegexBuilder<TCaptures & Record<K, string>, TFlags>(this.chunks, this._flags) as any;
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_setFlag<K extends string, V extends boolean>(
    _flag: K,
    _value: V
  ): RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const __unused = { _flag, _value };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>>(this.chunks, this._flags) as any;
  }

  private _buildPattern(nodes: ASTNode[]): string {
    return nodes
      .map((node) => {
        let result = node.value || '';
        if (node.children) {
          result += this._buildPattern(node.children);
        }
        return (node.prefix || '') + result + (node.suffix || '');
      })
      .join('');
  }

  private _getFlagsString(): string {
    let f = '';
    if (this._flags.global) f += 'g';
    if (this._flags.ignoreCase) f += 'i';
    if (this._flags.multiline) f += 'm';
    if (this._flags.dotAll) f += 's';
    if (this._flags.unicode) f += 'u';
    if (this._flags.unicodeSets) f += 'v';
    if (this._flags.sticky) f += 'y';
    if (this._flags.hasIndices) f += 'd';
    return f;
  }

  /**
   * Compiles the AST chunks into a native RegExp object and provides execution wrappers.
   * Ensures stateless execution by re-instantiating the RegExp for global/sticky matches.
   */
  private _extractCaptureNames(nodes: ASTNode[]): string[] {
    const names: string[] = [];
    for (const node of nodes) {
      if (node.type === 'capture') {
        // Extract from prefix which we know is constructed as `(?<Name>`
        const match = node.prefix?.match(/^\(\?<([a-zA-Z0-9_]+)>/);
        if (match) {
          names.push(match[1]);
        }
      }
      // raw node escape hatch allows manual captures via generic type, but we can't reliably
      // extract names from the raw string without parsing it, which we explicitly avoid.
      // If a user uses `.raw<{foo: string}>('(?<foo>...)')`, it will execute and work at runtime 
      // but won't be mapped by this exact automated list. They'll have to use `match.groups.foo` manually
      // if it falls back to native groups object, or we rely on the Proxy/Getter fallback.
      // Wait, we can safely just extract from the AST structure we control.
      
      if (node.children) {
        names.push(...this._extractCaptureNames(node.children));
      }
    }
    return names;
  }

  /**
   * Compiles the AST chunks into a native RegExp object and provides execution wrappers.
   * Ensures stateless execution by re-instantiating the RegExp for global/sticky matches.
   */
  compile(): CompiledRegex<TCaptures, TFlags> {
    const pattern = this._buildPattern(this.chunks);
    const flags = this._getFlagsString();

    const internalNative = new RegExp(pattern, flags);
    const isGlobal = this._flags.global === true;
    const isSticky = this._flags.sticky === true;
    const hasIndices = this._flags.hasIndices === true;
    const isUnicode = this._flags.unicode === true || this._flags.unicodeSets === true;

    // 1. Robust AST-based capture name extraction (ignores raw() false positives)
    const groupNames = Array.from(new Set(this._extractCaptureNames(this.chunks)));

    const isSimpleFastPath = groupNames.length === 0 && !hasIndices;

    // Pre-compile the execution route
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let execFn: (str: string) => any;

    if (isSimpleFastPath) {
      // FAST PATH: No capture groups, no indices. Return a simple POJO.
      if (isGlobal) {
        execFn = (str: string) => {
          return (function* () {
            const iterInstance = new RegExp(pattern, flags);
            let match: RegExpExecArray | null;
            while ((match = iterInstance.exec(str)) !== null) {
              yield { isMatch: true, match: match[0] };
              // 4. Global zero-length match guard
              if (match[0].length === 0) {
                if (isUnicode && iterInstance.lastIndex < str.length) {
                  // Advance correctly for unicode (handle surrogate pairs)
                  iterInstance.lastIndex += str.codePointAt(iterInstance.lastIndex)! > 0xffff ? 2 : 1;
                } else {
                  iterInstance.lastIndex++;
                }
              }
            }
          })();
        };
      } else if (isSticky) {
        execFn = (str: string) => {
          internalNative.lastIndex = 0;
          const match = internalNative.exec(str);
          internalNative.lastIndex = 0;
          return match ? { isMatch: true, match: match[0] } : { isMatch: false, match: null };
        };
      } else {
        execFn = (str: string) => {
          const match = internalNative.exec(str);
          return match ? { isMatch: true, match: match[0] } : { isMatch: false, match: null };
        };
      }
    } else {
      // COMPLEX PATH: Requires capture group mapping and/or indices.
      
      // We use a constructor function instead of `class` to dynamically attach
      // properties as enumerables on the instance so they survive `Object.keys()` and `...spread`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function MatchResultClass(this: any, raw: RegExpExecArray | null) {
        if (raw !== null) {
          this.isMatch = true;
          this.match = raw[0];
          
          // Eager assignment is significantly faster than Object.defineProperty for lazy getters
          // on the hot path, and correctly populates own enumerable properties for spread/JSON.
          if (raw.groups) {
            for (let i = 0; i < groupNames.length; i++) {
              const name = groupNames[i];
              this[name] = raw.groups[name];
            }
          } else {
             for (let i = 0; i < groupNames.length; i++) {
              this[groupNames[i]] = undefined;
            }
          }
        } else {
          this.isMatch = false;
          this.match = null;

          for (let i = 0; i < groupNames.length; i++) {
            this[groupNames[i]] = undefined;
          }
        }

        if (hasIndices) {
          // 5. Cache the indices object upon first access to avoid repeated allocations
          // disable-next-line @typescript-eslint/no-explicit-any
          let cachedIndices: any = undefined;
          Object.defineProperty(this, 'indices', {
            // @disable-next-line @typescript-eslint/no-explicit-any
            get() {
              if (raw === null) return undefined;
              if (cachedIndices !== undefined) return cachedIndices;
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const idx = (raw as any).indices;
              if (!idx) return undefined;
              
              // Avoid object spread, use manual assignment based on precomputed names
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const result: any = { match: idx[0] };
              if (idx.groups) {
                for (let i = 0; i < groupNames.length; i++) {
                  const gn = groupNames[i];
                  if (idx.groups[gn] !== undefined) {
                    result[gn] = idx.groups[gn];
                  }
                }
              }
              cachedIndices = result;
              return cachedIndices;
            },
            enumerable: true
          });
        }
      }

      if (isGlobal) {
        execFn = (str: string) => {
          return (function* () {
            const iterInstance = new RegExp(pattern, flags);
            let match: RegExpExecArray | null;
            while ((match = iterInstance.exec(str)) !== null) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              yield new (MatchResultClass as any)(match);
              
              // 4. Global zero-length match guard
              if (match[0].length === 0) {
                if (isUnicode && iterInstance.lastIndex < str.length) {
                  iterInstance.lastIndex += str.codePointAt(iterInstance.lastIndex)! > 0xffff ? 2 : 1;
                } else {
                  iterInstance.lastIndex++;
                }
              }
            }
          })();
        };
      } else if (isSticky) {
        execFn = (str: string) => {
          internalNative.lastIndex = 0;
          const match = internalNative.exec(str);
          internalNative.lastIndex = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new (MatchResultClass as any)(match);
        };
      } else {
        execFn = (str: string) => {
          const match = internalNative.exec(str);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new (MatchResultClass as any)(match);
        };
      }
    }

    return {
      pattern,
      toRegExp: () => new RegExp(pattern, flags),
      exec: execFn,
    };
  }
}

/**
 * Initializes a fresh, empty {@link RegexBuilder}.
 */
export function rx(): RegexBuilder<DefaultCaptures, DefaultFlags> {
  return new RegexBuilder();
}