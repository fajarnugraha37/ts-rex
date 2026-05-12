/**
 * A unique symbol used for nominal typing to identify RegexBuilder instances.
 */
export const entityKind: unique symbol = Symbol.for('regex:entityKind');

/**
 * Represents the default state for regex flags (all disabled).
 */
export type DefaultFlags = Record<string, never>;

/**
 * Represents the default state for captured groups (empty).
 */
export type DefaultCaptures = Record<string, never>;

/**
 * Represents a node in the internal Abstract Syntax Tree of the regex.
 */
export interface ASTNode {
  /** The type of regex component (e.g., 'literal', 'class', 'capture'). */
  type: string;
  /** The raw string value of the pattern chunk. */
  value?: string;
  /** Nested nodes (used for groups, quantifiers, and alternations). */
  children?: ASTNode[];
  /** String to prepend to the node during compilation. */
  prefix?: string;
  /** String to append to the node during compilation. */
  suffix?: string;
}

/**
 * Represents a successful match result.
 * 
 * @typeParam TCaptures - The record of named capture groups inferred from the builder.
 * @typeParam TFlags - The active regex flags.
 */
export type SingleMatch<TCaptures, TFlags> = TCaptures & { 
  /** Indicates the match was successful. */
  isMatch: true; 
  /** The full text matched by the entire regex. */
  match: string; 
} &
  (TFlags extends { hasIndices: true } 
    ? { 
        /** Start and end offsets for each capture group. Requires the 'd' flag. */
        readonly indices: Record<keyof TCaptures, [number, number]> & { match: [number, number] } 
      } 
    : Record<string, never>);

/**
 * Represents a failed match, providing safe null/undefined access to properties.
 * 
 * @typeParam TCaptures - The record of named capture groups that would have been returned.
 * @typeParam TFlags - The active regex flags.
 */
export type FailedMatch<TCaptures, TFlags> = { 
  /** Indicates the match failed. */
  isMatch: false; 
  /** Always null on failure. */
  match: null; 
} &
  { [K in keyof TCaptures]: undefined } &
  (TFlags extends { hasIndices: true } 
    ? { 
        /** Always undefined on failure. */
        readonly indices: undefined 
      } 
    : Record<string, never>);

/**
 * The unified return type of the {@link CompiledRegex.exec} method.
 * Handles single matches, failed matches, and global iterators.
 */
export type MatchResult<TCaptures, TFlags> =
  TFlags extends { global: true }
    ? IterableIterator<SingleMatch<TCaptures, TFlags>>
    : SingleMatch<TCaptures, TFlags> | FailedMatch<TCaptures, TFlags>;

/**
 * The compiled output of a {@link RegexBuilder}.
 */
export interface CompiledRegex<
  TCaptures,
  TFlags
> {
  /** The generated raw regex pattern string. */
  pattern: string;
  /** The native JavaScript RegExp instance. */
  native: RegExp;
  /** 
   * Executes the regex against a string.
   * This method is stateless; it creates a fresh RegExp instance for every call
   * to avoid `lastIndex` side-effects.
   * 
   * @param str - The input string to test.
   * @returns A {@link MatchResult} containing the match data or an iterator.
   */
  exec: (str: string) => MatchResult<TCaptures, TFlags>;
}

export interface RegexBuilder<
  TCaptures extends Record<string, unknown>,
  TFlags extends Record<string, unknown>
> {
  /**
   * Escapes string input to match characters literally.
   * Automatically escapes characters with special regex meaning.
   */
  literal(str: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any single character except line terminators.
   * Maps to `.`.
   */
  anyChar(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any digit (0-9).
   * Maps to `\d`.
   */
  digit(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any character that is not a digit.
   * Maps to `\D`.
   */
  notDigit(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any alphanumeric character from the basic Latin alphabet, including the underscore.
   * Maps to `\w`.
   */
  wordChar(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any character that is not a word character.
   * Maps to `\W`.
   */
  notWordChar(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a single white space character.
   * Maps to `\s`.
   */
  whitespace(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a single character other than white space.
   * Maps to `\S`.
   */
  notWhitespace(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches any one of the enclosed characters.
   * Maps to `[...]`.
   */
  anyOf(chars: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches anything that is not enclosed.
   * Maps to `[^...]`.
   */
  noneOf(chars: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character in the specified range.
   * Maps to `[start-end]`.
   */
  range(start: string, end: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a NUL character (U+0000).
   * Maps to `\0`.
   */
  nullChar(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a line feed.
   * Maps to `\n`.
   */
  newline(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a carriage return.
   * Maps to `\r`.
   */
  carriageReturn(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a horizontal tab.
   * Maps to `\t`.
   */
  tab(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a vertical tab (U+000B).
   * Maps to `\v`.
   */
  verticalTab(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a form feed (U+000C).
   * Maps to `\f`.
   */
  formFeed(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a control character (e.g., `\cM` for Ctrl-M).
   * Maps to `\cX`.
   */
  controlChar(char: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character by its 2-digit hexadecimal code.
   * Maps to `\xNN`.
   */
  hex(nn: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character by its 4-digit Unicode hex value.
   * Maps to `\uNNNN`.
   */
  unicodeChar(nnnn: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a Unicode code point (requires `u` or `v` flag).
   * Maps to `\u{NNNN}`.
   */
  unicodeCodePoint(nnnn: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character based on its Unicode category.
   * Maps to `\p{P}`.
   */
  unicodeProperty(prop: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a character not in the specified Unicode category.
   * Maps to `\P{P}`.
   */
  notUnicodeProperty(prop: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches the beginning of the input.
   * Maps to `^`.
   */
  startOfInput(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches the end of the input.
   * Maps to `$`.
   */
  endOfInput(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a word boundary.
   * Maps to `\b`.
   */
  wordBoundary(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches a non-word boundary.
   * Maps to `\B`.
   */
  nonWordBoundary(): RegexBuilder<TCaptures, TFlags>;

  /**
   * **Power User Escape Hatch**: Injects the exact string into the AST without any auto-escaping protection.
   * Allows freely injecting raw regex patterns if the fluent syntax is too restrictive.
   * @param str The raw regex string to inject.
   */
  raw(str: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * **Power User Escape Hatch**: Generates `[str]` exactly as typed without any auto-escaping protection.
   * Use this to construct complex, unescaped character ranges manually.
   * @param str The raw regex string to wrap in brackets.
   */
  rawClass(str: string): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches the nested builder pattern but does not remember the match (non-capturing group).
   * Maps to `(?:...)`.
   */
  group<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, unknown>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the nested builder pattern and stores it as a named group.
   * Maps to `(?<Name>...)`.
   */
  capture<
    Name extends string,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, unknown>
  >(
    name: Name,
    builder: RegexBuilder<InnerCaptures, InnerFlags>
  ): RegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;

  /**
   * Matches the wrapped pattern 0 or more times.
   * Maps to `(?:...)*`.
   * At the type level, marks all inner captures as optional.
   */
  zeroOrMore<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

  /**
   * Matches the wrapped pattern 1 or more times.
   * Maps to `(?:...)+`.
   */
  oneOrMore<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the wrapped pattern 0 or 1 times (optional).
   * Maps to `(?:...)?`.
   * At the type level, marks all inner captures as optional.
   */
  optional<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

  /**
   * Matches the wrapped pattern exactly "n" occurrences.
   * Maps to `(?:...){n}`.
   */
  times<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(n: number, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches the wrapped pattern at least "n" occurrences.
   * Maps to `(?:...){n,}`.
   * At the type level, if n = 0, inner captures are marked optional.
   */
  atLeast<
    N extends number,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(n: N, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & (N extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>;

  /**
   * Matches the wrapped pattern between "min" and "max" occurrences.
   * Maps to `(?:...){min,max}`.
   * At the type level, if min = 0, inner captures are marked optional.
   */
  between<
    Min extends number,
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(min: Min, max: number, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & (Min extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>;

  /**
   * Modifies the preceding quantifier to match the minimum number of times (lazy/non-greedy).
   * Appends `?` to the previous quantifier chunk.
   */
  lazy(): RegexBuilder<TCaptures, TFlags>;

  /**
   * Matches either the pattern built so far OR the passed builder pattern.
   * Maps to `(?:...|...)`.
   * Calculates the union of captures from both branches, representing mutual exclusivity.
   */
  or<
    OtherCaptures extends Record<string, unknown>,
    OtherFlags extends Record<string, unknown>
  >(
    builder: RegexBuilder<OtherCaptures, OtherFlags>
  ): RegexBuilder<Partial<TCaptures> & Partial<OtherCaptures>, TFlags>;

  /**
   * Matches only if the current position is followed by the passed pattern.
   * Maps to `(?=...)`.
   */
  lookahead<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is not followed by the passed pattern.
   * Maps to `(?!...)`.
   */
  negativeLookahead<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is preceded by the passed pattern.
   * Maps to `(?<=...)`.
   */
  lookbehind<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches only if the current position is not preceded by the passed pattern.
   * Maps to `(?<!...)`.
   */
  negativeLookbehind<
    InnerCaptures extends Record<string, unknown>,
    InnerFlags extends Record<string, boolean>
  >(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>;

  /**
   * Matches exact text captured by a previously named group.
   * Maps to `\k<name>`.
   */
  matchPrevious<Name extends keyof TCaptures>(name: Name): RegexBuilder<TCaptures, TFlags>;

  /**
   * Enables global matching (g flag).
   * Modifies the execution return type to an IterableIterator.
   */
  global(): RegexBuilder<TCaptures, Omit<TFlags, 'global'> & { global: true }>;

  /**
   * Enables case-insensitive matching (i flag).
   */
  ignoreCase(): RegexBuilder<TCaptures, Omit<TFlags, 'ignoreCase'> & { ignoreCase: true }>;

  /**
   * Enables multiline matching (m flag).
   * Causes ^ and $ to match the begin/end of each line.
   */
  multiline(): RegexBuilder<TCaptures, Omit<TFlags, 'multiline'> & { multiline: true }>;

  /**
   * Enables dotAll matching (s flag).
   * Allows . to match newline characters.
   */
  dotAll(): RegexBuilder<TCaptures, Omit<TFlags, 'dotAll'> & { dotAll: true }>;

  /**
   * Enables unicode matching (u flag).
   * Treats pattern as a sequence of Unicode code points.
   */
  unicode(): RegexBuilder<TCaptures, Omit<TFlags, 'unicode'> & { unicode: true }>;

  /**
   * Enables unicodeSets matching (v flag - ES2024).
   * Upgrades u flag. Enables set operations in char classes.
   */
  unicodeSets(): RegexBuilder<TCaptures, Omit<TFlags, 'unicodeSets'> & { unicodeSets: true }>;

  /**
   * Enables sticky matching (y flag).
   * Matches only from the index indicated by the lastIndex property.
   */
  sticky(): RegexBuilder<TCaptures, Omit<TFlags, 'sticky'> & { sticky: true }>;

  /**
   * Enables indices (d flag).
   * Adds start/end indices to the match results.
   */
  withIndices(): RegexBuilder<TCaptures, Omit<TFlags, 'hasIndices'> & { hasIndices: true }>;
}

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
    return new RegexBuilder<NewCaptures, NewFlags>([...this.chunks, chunk], this._flags);
  }

  raw(str: string): RegexBuilder<TCaptures, TFlags> {
    return this._chain({ type: 'raw', value: str });
  }

  rawClass(str: string): RegexBuilder<TCaptures, TFlags> {
    return this._chain({ type: 'rawClass', value: `[${str}]` });
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const __unused = { _flag, _value };
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
        // Return an iterator for global matches
        return (function* () {
          let match: RegExpExecArray | null;
          while ((match = instance.exec(str)) !== null) {
            yield mapMatch(match);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })() as IterableIterator<SingleMatch<TCaptures, TFlags>> as any;
      }

      // Single match
      const match = instance.exec(str);
      return (match ? mapMatch(match) : { isMatch: false, match: null }) as MatchResult<TCaptures, TFlags>;
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
