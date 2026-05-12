export const entityKind: unique symbol = Symbol.for('regex:entityKind');

export type DefaultFlags = {};

export type DefaultCaptures = {};

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  prefix?: string;
  suffix?: string;
}

/**
 * Represents the result of a regex execution, handling global iterators and null matches.
 */
export type MatchResult<TCaptures, TFlags> =
  TFlags extends { global: true }
    ? IterableIterator<SingleMatch<TCaptures, TFlags>>
    : SingleMatch<TCaptures, TFlags> | null;

/**
 * Represents a single match result, including capture groups and optional indices.
 */
export type SingleMatch<TCaptures, TFlags> = TCaptures & 
  (TFlags extends { hasIndices: true } 
    ? { readonly indices: Record<keyof TCaptures, [number, number]> } 
    : {});

export interface CompiledRegex<
  TCaptures,
  TFlags
> {
  pattern: string;
  native: RegExp;
  exec: (str: string) => MatchResult<TCaptures, TFlags>;
}

export class RegexBuilder<
  TCaptures extends Record<string, any> = DefaultCaptures,
  TFlags extends Record<string, any> = DefaultFlags
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
    NewCaptures extends Record<string, any> = TCaptures,
    NewFlags extends Record<string, any> = TFlags
  >(chunk: ASTNode): RegexBuilder<NewCaptures, NewFlags> {
    return new RegexBuilder<NewCaptures, NewFlags>([...this.chunks, chunk], this._flags);
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_addCapture<K extends string>(): RegexBuilder<TCaptures & Record<K, string>, TFlags> {
    return new RegexBuilder<TCaptures & Record<K, string>, TFlags>(this.chunks, this._flags);
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_setFlag<K extends string, V extends boolean>(
    _flag: K,
    _value: V
  ): RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>> {
    return new RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>>(this.chunks, this._flags);
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
    
    // We instantiate one native regex for inspection purposes
    const native = new RegExp(pattern, flags);

    const exec = (str: string): MatchResult<TCaptures, TFlags> => {
      // Create a fresh instance for every execution to guarantee statelessness (avoid lastIndex bugs)
      const instance = new RegExp(pattern, flags);
      
      const mapMatch = (match: RegExpExecArray): SingleMatch<TCaptures, TFlags> => {
        const groups = (match.groups || {}) as TCaptures;
        if (this._flags.hasIndices && (match as any).indices) {
          return {
            ...groups,
            indices: (match as any).indices.groups,
          } as SingleMatch<TCaptures, TFlags>;
        }
        return groups as SingleMatch<TCaptures, TFlags>;
      };

      if (this._flags.global) {
        // Return an iterator for global matches
        return (function* () {
          let match;
          while ((match = instance.exec(str)) !== null) {
            yield mapMatch(match);
          }
        })() as unknown as MatchResult<TCaptures, TFlags>;
      }

      // Single match
      const match = instance.exec(str);
      return (match ? mapMatch(match) : null) as MatchResult<TCaptures, TFlags>;
    };

    return {
      pattern,
      native,
      exec,
    };
  }
}

export function rx(): RegexBuilder<DefaultCaptures, DefaultFlags> {
  return new RegexBuilder();
}
