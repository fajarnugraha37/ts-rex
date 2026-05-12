export const entityKind: unique symbol = Symbol.for('regex:entityKind');

export type DefaultFlags = Record<string, never>;

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  // Add other properties as needed in the future
}

export interface CompiledRegex<
  TCaptures,
  TFlags
> {
  pattern: string;
  native: RegExp;
  exec: (str: string) => TCaptures | null;
}

export class RegexBuilder<
  TCaptures extends Record<string, string> = Record<string, never>,
  TFlags extends Record<string, boolean> = DefaultFlags
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

  constructor(public readonly chunks: ASTNode[] = []) {}

  /**
   * @internal
   * Returns a completely new instance of the builder with the appended AST node.
   * This explicitly enforces the immutability architectural pillar.
   */
  _chain<
    NewCaptures extends Record<string, string> = TCaptures,
    NewFlags extends Record<string, boolean> = TFlags
  >(chunk: ASTNode): RegexBuilder<NewCaptures, NewFlags> {
    return new RegexBuilder<NewCaptures, NewFlags>([...this.chunks, chunk]);
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_addCapture<K extends string>(): RegexBuilder<TCaptures & Record<K, string>, TFlags> {
    return new RegexBuilder<TCaptures & Record<K, string>, TFlags>(this.chunks);
  }

  /**
   * INTERNAL ONLY: Digunakan untuk memvalidasi akumulasi tipe di unit test.
   * Tidak akan muncul di dokumentasi publik.
   */
  _test_setFlag<K extends string, V extends boolean>(
    _flag: K,
    _value: V
  ): RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>> {
    return new RegexBuilder<TCaptures, Omit<TFlags, K> & Record<K, V>>(this.chunks);
  }

  private _buildPattern(nodes: ASTNode[]): string {
    return nodes
      .map((node) => {
        let result = node.value || '';
        if (node.children) {
          result += this._buildPattern(node.children);
        }
        return result;
      })
      .join('');
  }

  /**
   * Compiles the AST chunks into a native RegExp object and provides execution wrappers.
   * Implementation stubbed out for Phase 1.
   */
  compile(): CompiledRegex<TCaptures, TFlags> {
    const pattern = this._buildPattern(this.chunks);
    return {
      pattern,
      native: new RegExp(pattern),
      exec: () => null,
    };
  }
}

export function rx(): RegexBuilder<Record<string, never>, DefaultFlags> {
  return new RegexBuilder();
}
