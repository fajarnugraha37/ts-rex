export const entityKind: unique symbol = Symbol.for('regex:entityKind');

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  // Add other properties as needed in the future
}

export class RegexBuilder<
  TCaptures extends Record<string, string> = Record<string, never>,
  TFlags extends Record<string, boolean> = Record<string, never>
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
   * Compiles the AST chunks into a native RegExp object.
   * Implementation stubbed out for Phase 1.
   */
  compile(): RegExp {
    return new RegExp('');
  }
}

export function rx(): RegexBuilder<Record<string, never>, Record<string, never>> {
  return new RegexBuilder();
}
