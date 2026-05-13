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
    
    // High performance cached instance for isolated execution.
    // This is purposefully NOT exposed externally to guarantee state immutability.
    const internalNative = new RegExp(pattern, flags);
    const isStateful = this._flags.global || this._flags.sticky;

    const exec = (str: string): MatchResult<TCaptures, TFlags> => {
      const mapMatch = (match: RegExpExecArray): SingleMatch<TCaptures, TFlags> => {
        const groups = (match.groups || {}) as TCaptures;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = { isMatch: true, ...groups, match: match[0] };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this._flags.hasIndices && (match as any).indices) {
          result.indices = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...((match as any).indices.groups || {}),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            match: (match as any).indices[0],
          };
        }
        return result as SingleMatch<TCaptures, TFlags>;
      };

      if (this._flags.global) {
        // Path B: Iterable (Stateful iteration requires isolated instance per call)
        // We clone the regex to guarantee isolation for this specific generator
        return (function* () {
          const iterInstance = new RegExp(pattern, flags);
          let match: RegExpExecArray | null;
          while ((match = iterInstance.exec(str)) !== null) {
            yield mapMatch(match);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })() as IterableIterator<SingleMatch<TCaptures, TFlags>> as any;
      }

      // Path A: Single Match (High Performance Cached Execution)
      if (isStateful) {
        internalNative.lastIndex = 0; // Explicitly reset state before run
      }
      const match = internalNative.exec(str);
      
      // Safety cleanup for sticky flag (global is handled above in Path B)
      if (isStateful) {
        internalNative.lastIndex = 0;
      }

      return (match ? mapMatch(match) : { isMatch: false, match: null }) as MatchResult<TCaptures, TFlags>;
    };

    return {
      pattern,
      toRegExp: () => new RegExp(pattern, flags),
      exec,
    };
  }
}

/**
 * Initializes a fresh, empty {@link RegexBuilder}.
 */
export function rx(): RegexBuilder<DefaultCaptures, DefaultFlags> {
  return new RegexBuilder();
}
