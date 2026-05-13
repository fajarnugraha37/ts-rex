import { entityKind } from './types';
import type { 
  ASTNode, 
  DefaultCaptures, 
  DefaultFlags, 
  CompiledRegex, 
  MatchResult, 
  SingleMatch,
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
  compile(): CompiledRegex<TCaptures, TFlags> {
    const pattern = this._buildPattern(this.chunks);
    const flags = this._getFlagsString();

    const internalNative = new RegExp(pattern, flags);
    const isGlobal = this._flags.global === true;
    const isSticky = this._flags.sticky === true;
    const hasIndices = this._flags.hasIndices === true;

    const failResult = { isMatch: false, match: null } as MatchResult<TCaptures, TFlags>;

    // Pre-extract all capture group names from the final pattern string
    const groupNamesMatch = pattern.matchAll(/\(\?<([a-zA-Z0-9_]+)>/g);
    const groupNames = Array.from(groupNamesMatch).map(m => m[1]);

    // Create a dynamic monomorphic class for this specific regex
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class MatchResultClass {
      isMatch = true;
      match: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      private _raw: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(raw: any) {
        this.match = raw[0];
        this._raw = raw;
      }
    }

    for (const name of groupNames) {
      Object.defineProperty(MatchResultClass.prototype, name, {
        get() { return this._raw.groups?.[name]; },
        enumerable: true
      });
    }

    if (hasIndices) {
      Object.defineProperty(MatchResultClass.prototype, 'indices', {
        get() {
          const idx = this._raw.indices;
          if (!idx) return undefined;
          return { ...(idx.groups || {}), match: idx[0] };
        },
        enumerable: true
      });
    }

    // Pre-compile the execution route
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let execFn: (str: string) => any;

    if (isGlobal) {
      execFn = (str: string) => {
        return (function* () {
          const iterInstance = new RegExp(pattern, flags);
          let match: RegExpExecArray | null;
          while ((match = iterInstance.exec(str)) !== null) {
            yield new MatchResultClass(match);
          }
        })();
      };
    } else if (isSticky) {
      execFn = (str: string) => {
        internalNative.lastIndex = 0;
        const match = internalNative.exec(str);
        internalNative.lastIndex = 0;
        return match ? new MatchResultClass(match) : failResult;
      };
    } else {
      execFn = (str: string) => {
        // Absolute fastest path: No state mutation needed, no global iterators
        const match = internalNative.exec(str);
        return match ? new MatchResultClass(match) : failResult;
      };
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
