import type { AlternationMethods } from '../syntax/alternation';
import type { BoundaryMethods } from '../syntax/boundaries';
import type { CharacterClassMethods } from '../syntax/character-classes';
import type { FlagMethods } from '../syntax/flags';
import type { GroupMethods } from '../syntax/groups';
import type { LookaroundMethods } from '../syntax/lookarounds';
import type { QuantifierMethods } from '../syntax/quantifiers';

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
 * The core builder interface for constructing type-safe regular expressions.
 * Methods are populated via module augmentation in src/syntax/*.ts.
 * 
 * @typeParam TCaptures - A record of named capture groups inferred from the builder.
 * @typeParam TFlags - A record of regex flags currently enabled.
 */
export interface RegexBuilder<
  TCaptures extends Record<string, unknown> = DefaultCaptures,
  TFlags extends Record<string, unknown> = DefaultFlags
> extends 
    AlternationMethods<TCaptures, TFlags>,
    BoundaryMethods<TCaptures, TFlags>,
    CharacterClassMethods<TCaptures, TFlags>,
    FlagMethods<TCaptures, TFlags>,
    GroupMethods<TCaptures, TFlags>,
    LookaroundMethods<TCaptures, TFlags>,
    QuantifierMethods<TCaptures, TFlags> 
{
  /**
   * Compiles the AST chunks into a native RegExp object and provides execution wrappers.
   */
  compile(): CompiledRegex<TCaptures, TFlags>;

  /**
   * **Power User Escape Hatch**: Injects the exact string into the AST without any auto-escaping protection.
   * Allows manual registration of capture groups via the generic parameter.
   * @typeParam NewCaptures - Manually specified capture groups present in the raw string.
   */
  raw<NewCaptures extends Record<string, unknown> = Record<string, never>>(
    str: string
  ): RegexBuilder<TCaptures & NewCaptures, TFlags>;

  /**
   * **Power User Escape Hatch**: Generates `[str]` exactly as typed without any auto-escaping protection.
   */
  rawClass(str: string): RegexBuilder<TCaptures, TFlags>;
}

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
  /** 
   * A factory method that creates and returns a fresh native JavaScript RegExp instance.
   * Exposing a factory instead of a mutable instance prevents state corruption (e.g. lastIndex)
   * if the regex is passed to external libraries or used concurrently.
   */
  toRegExp: () => RegExp;
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
