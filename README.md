# Type-Safe Regex (TS-Rex) without the headache

[![NPM Version](https://img.shields.io/npm/v/@fajarnugraha37/ts-rex.svg)](https://www.npmjs.com/package/@fajarnugraha37/ts-rex) [![JSR Version](https://jsr.io/badges/@fajar/ts-rex)](https://jsr.io/@fajar/ts-rex)

<h1 align="center">
  <a href="https://github.com/fajarnugraha37/ts-rex">
    <picture>
      <img height="500" alt="TS-Rex Logo" src="https://raw.githubusercontent.com/fajarnugraha37/ts-rex/refs/heads/main/assets/logo.png">
    </picture>
  </a>
</h1>

<p align="center">
  <em><b>TS-Rex</b> is a zero-dependency, meta-programming utility designed to eliminate the brittleness of standard JavaScript RegExp matching. Inspired by Drizzle ORM, it enables developers to construct complex regular expressions through an intuitive chainable API while statically inferring the exact shape of named capturing groups and execution outputs at compile time.</em>
</p>

<p align="center">
  <a href="https://ts-rex.nugrahafajar.my.id/"><b>Read the Official Documentation</b></a>
</p>

---

## Tech Stack

- [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/): The core logic and advanced generic type system.
- [![Bun](https://img.shields.io/badge/Bun-1.0+-green.svg)](https://bun.sh/): Used for dependency management, test running, and linting.
- **tsup**: Bundler for UMD, CJS, ESM, and type declarations.
- **expect-type**: Static type assertion utility for unit testing.

## Architecture

TS-Rex is built upon four architectural pillars:

1. **AST Generation**: Instead of manipulating strings that can easily become malformed, every chained method appends an AST node to an internal array.
2. **Immutability**: Each method call creates and returns a completely new `RegexBuilder` instance. This allows you to safely branch regex definitions (e.g., saving a base pattern into a variable and extending it multiple times) without unintended side effects.
3. **Phantom Type State**: As you chain methods like `.capture()`, `.optional()`, or `.or()`, TypeScript infers and records the resulting group names and optionality within the generic state. This happens entirely during compilation, imposing **zero** runtime memory overhead.
4. **Runtime Compilation**: Calling `.compile()` collapses the AST into a native JavaScript `RegExp` instance and binds the execution context flags, returning a strict type-safe execution wrapper.

## Features

- **Fluent API**: Chain methods to build regex patterns programmatically.
- **Static Type Inference**: Named capturing groups are automatically inferred as strongly-typed objects at compile time.
- **Stateless Execution**: The `.exec()` wrapper instantiates fresh `RegExp` objects to prevent state mutation bugs associated with the `g` and `y` flags.
- **Deep Optionality**: Quantifiers (`.optional()`, `.zeroOrMore()`) and alternations (`.or()`) correctly map captured properties to `Partial` or union types.
- **Zero Dependencies**: Built entirely on standard TypeScript and native `RegExp`.

## Core Entities

To effectively use this library, you should understand these core entities:

- `rx()`: The factory function that initializes a fresh, empty builder.
- `RegexBuilder`: The immutable builder class. Exposes dozens of chainable, strictly-typed methods (`.literal()`, `.digit()`, `.capture()`, etc.).
- `CompiledRegex`: The object returned by `.compile()`. It contains:
  - `pattern`: The raw string representation of the regex.
  - `native`: The native JavaScript `RegExp` instance.
  - `exec(string)`: The type-safe extractor method.
- `MatchResult`: The discriminated union returned by `.exec()`. 
  - On failure: `{ isMatch: false, match: null, [captureName]: undefined }`
  - On success: `{ isMatch: true, match: string, ...[Your Captures] }`. (If the `.global()` flag is set, this becomes an `IterableIterator` of successful matches).

## Philosophy: Auto-Escaping and Safety First

To protect from malformed regular expressions, `ts-rex` heavily enforces **Automatic Escaping**. 

If you use `.literal('http://')` or `.anyOf('a-z')`, the library will automatically escape all special regex characters. For example, `rx().anyOf('a-z')` complies to `[a\-z]`, meaning it searches for the literal characters "a", "-", and "z", **not** a range.

> [!WARNING]  
> Do not attempt to inject raw regex strings into builder methods. To build complex character classes (like `[a-zA-Z0-9.-]`), you must compose them using the type-safe methods:
> 
> ```typescript
> // Correct way to compose ranges
> const myClass = rx()
>   .range('a', 'z')
>   .or(rx().range('A', 'Z'))
>   .or(rx().range('0', '9'))
>   .or(rx().anyOf('.-')); 
>   // Compiles to: (?:(?:(?:[a-z]|[A-Z])|[0-9])|[.\-])
> ```
> This verbose compilation behaves 100% identically to `[a-zA-Z0-9.-]` in regex engines but guarantees syntactic safety.

> [!NOTE]
> If you find the strict composition syntax too limiting and need to inject raw, unescaped regex strings, `ts-rex` provides two escape hatches for power users:
>
> 1. **`.rawClass(str: string)`**: Generates `[str]` exactly as typed without any auto-escaping protection. (Example: `rx().rawClass('a-zA-Z0-9.-')` -> `[a-zA-Z0-9.-]`).
> 2. **`.raw<NewCaptures>(str: string)`**: Allows you to freely inject any raw regex pattern directly into the AST. The optional generic parameter allows you to manually register named capture groups for full type safety.
>
> ```typescript
> const parser = rx()
>   .raw<{ userId: string }>("(?<userId>\\d+)")
>   .compile();
> ```

## Getting Started

### Installation

```bash
# via npmjs
bun add @fajarnugraha37/ts-rex
npm install @fajarnugraha37/ts-rex
pnpm add @fajarnugraha37/ts-rex

# via jsr
bunx jsr add @fajar/ts-rex
npx jsr add @fajar/ts-rex
pnpm i jsr:@fajar/ts-rex
```

> [!NOTE]  
> This library requires TypeScript version 5.0 or higher for full advanced type inference support.

## Usage

### Basic Capturing

Named capture groups automatically populate the output signature of `.exec()`.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Build a pattern
const pattern = rx()
  .startOfInput()
  .capture('firstName', rx().oneOrMore(rx().wordChar()))
  .whitespace()
  .capture('lastName', rx().oneOrMore(rx().wordChar()))
  .endOfInput()
  .compile();

// Execute the pattern
const result = pattern.exec('John Doe');

if (result.isMatch) {
  // Types are fully inferred based on the captures defined above
  console.log(result.firstName); // "John"
  console.log(result.lastName);  // "Doe"
  console.log(result.match);     // "John Doe" (The full match)
}
```

### Global Iteration

Flags dynamically modify the return type of `.exec()`. Using the `.global()` flag changes the result from a single object to an `IterableIterator`. Execution is fully stateless to avoid native `lastIndex` bugs.

```typescript
const pattern = rx()
  .capture('num', rx().oneOrMore(rx().digit()))
  .global()
  .compile();

const results = pattern.exec('I have 3 apples and 42 bananas');

for (const result of results) {
  console.log(result.num); // "3", "42"
}
```

### Match Indices

Using the `.withIndices()` flag (ECMAScript `d` flag) injects an `indices` property containing `[start, end]` tuples for the full match and every captured group.

```typescript
const pattern = rx()
  .capture('val', rx().wordChar())
  .withIndices()
  .compile();

const result = pattern.exec('a');

if (result.isMatch) {
  console.log(result.indices.match); // [0, 1]
  console.log(result.indices.val);   // [0, 1]
}
```

### Alternation and Optionality

Using `.or()` creates a union type, ensuring mutually exclusive access to capturing groups.

```typescript
const pattern = rx()
  .capture('a', rx().literal('A'))
  .or(rx().capture('b', rx().literal('B')))
  .compile();

const result = pattern.exec('A');

if (result.isMatch) {
  // TypeScript enforces that either 'a' is a string and 'b' is undefined, or vice versa.
  console.log(result.a);
}
```

## Supported Regex Operations and Tokens

`ts-rex` supports almost the entire ECMAScript (ES2024) Regular Expression syntax.

### Assertions and Boundaries
| Regex | API Method | Description |
| :--- | :--- | :--- |
| `^` | `.startOfInput()` | Matches the beginning of the input. |
| `$` | `.endOfInput()` | Matches the end of the input. |
| `\b` | `.wordBoundary()` | Matches a word boundary. |
| `\B` | `.nonWordBoundary()` | Matches a non-word boundary. |
| `(?=y)`| `.lookahead(builder)` | Matches only if followed by the pattern. |
| `(?!y)`| `.negativeLookahead(builder)` | Matches only if NOT followed by the pattern. |
| `(?<=y)`| `.lookbehind(builder)` | Matches only if preceded by the pattern. |
| `(?<!y)`| `.negativeLookbehind(builder)`| Matches only if NOT preceded by the pattern. |

### Character Classes and Escapes
| Regex | API Method | Description |
| :--- | :--- | :--- |
| `.` | `.anyChar()` | Matches any single character. |
| `\d` | `.digit()` | Matches any digit (0-9). |
| `\D` | `.notDigit()` | Matches any character that is not a digit. |
| `\w` | `.wordChar()` | Matches any alphanumeric character. |
| `\W` | `.notWordChar()` | Matches any non-word character. |
| `\s` | `.whitespace()` | Matches a single white space character. |
| `\S` | `.notWhitespace()` | Matches a single non-white space character. |
| `[abc]` | `.anyOf('abc')` | Matches any enclosed character (auto-escapes internals). |
| `[^abc]`| `.noneOf('abc')` | Matches anything not enclosed. |
| `[a-z]` | `.range('a', 'z')` | Matches a character in the specified range. |
| `\xNN` | `.hex('NN')` | Matches a character by its 2-digit hex code. |
| `\uNNNN`| `.unicodeChar('NNNN')` | Matches a character by its 4-digit Unicode hex value. |
| `\u{N}` | `.unicodeCodePoint('NNNN')` | Matches a Unicode code point. |
| `\p{P}` | `.unicodeProperty('...')` | Matches a character based on its Unicode category. |
| `\n`, `\t`| `.newline()`, `.tab()`, etc | Named control characters. |

### Quantifiers
| Regex | API Method | Description |
| :--- | :--- | :--- |
| `*` | `.zeroOrMore(builder)` | Matches 0 or more times. Maps nested captures to `Partial`. |
| `+` | `.oneOrMore(builder)` | Matches 1 or more times. |
| `?` | `.optional(builder)` | Matches 0 or 1 times. Maps nested captures to `Partial`. |
| `{n}` | `.times(n, builder)` | Matches exactly "n" occurrences. |
| `{n,}` | `.atLeast(n, builder)` | Matches at least "n" occurrences. |
| `{n,m}`| `.between(n, m, builder)`| Matches between "n" and "m" occurrences. |
| `*?` | `.lazy()` | Appended to quantifiers to make them non-greedy. |

### Groups and Logic
| Regex | API Method | Description |
| :--- | :--- | :--- |
| `(?:x)` | `.group(builder)` | Non-capturing group. |
| `(?<N>x)`| `.capture('N', builder)` | Named capturing group. Extracts to the TS output object. |
| `\k<N>` | `.matchPrevious('N')` | Matches exact text captured previously. Statically checked. |
| `x\|y` | `.or(builder)` | Matches either branch. Resolves to a TS Union type. |

### Flags
| Regex | API Method | Description |
| :--- | :--- | :--- |
| `g` | `.global()` | Global iteration. Changes `.exec()` return type to `IterableIterator`. |
| `i` | `.ignoreCase()` | Case-insensitive match. |
| `m` | `.multiline()` | Modifies `^` and `$`. |
| `s` | `.dotAll()` | Allows `.` to match newlines. |
| `d` | `.withIndices()` | Appends `.indices` tuple objects into the `.exec()` return type. |
| `v`, `y`, `u` | `.unicodeSets()`, `.sticky()`, `.unicode()` | Other modern ES context flags. |

## Advanced Example: URL Parser

This example demonstrates how nested captures, alternations, deep optionality, and character classes seamlessly merge into a strictly typed result object. Notice how we compose small regex builders into larger ones.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Matches 'http' or 'https'
const protocol = rx().capture('protocol', rx().literal('http').optional(rx().literal('s')));

// Combine ranges and specific characters safely
const alphanumeric = rx()
  .range('a', 'z')
  .or(rx().range('A', 'Z'))
  .or(rx().range('0', '9'));

// Password allows alphanumeric and special characters
const passwordChars = alphanumeric.or(rx().anyOf('!@#$%^&*'));

const auth = rx().capture(
  'auth',
  rx()
    .capture('username', rx().oneOrMore(rx().wordChar()))
    .literal(':')
    .capture('password', rx().oneOrMore(passwordChars))
    .literal('@')
);

// Domain allows lowercase letters, numbers, dot, and hyphen
const domainChars = rx().range('a', 'z').or(rx().range('0', '9')).or(rx().anyOf('.-'));

const urlParser = rx()
  .startOfInput()
  .group(protocol)
  .literal('://')
  .optional(auth) // Automatically makes auth, username, and password types Partial
  .capture('domain', rx().oneOrMore(domainChars))
  .optional(
    rx()
      .literal(':')
      .capture('port', rx().oneOrMore(rx().digit()))
  )
  .optional(
    rx()
      .literal('/')
      .capture('path', rx().zeroOrMore(rx().notWhitespace()))
  )
  .endOfInput()
  .compile();

const parsed = urlParser.exec('https://admin:secret123@api.example.com:8080/v1/users');

if (parsed.isMatch) {
  // Types are fully mapped based on `.optional()` wrappers!
  console.log(parsed.protocol); // "https" (Type: string)
  console.log(parsed.domain);   // "api.example.com" (Type: string)
  
  // Auth details are typed as string | undefined because of `.optional(auth)`
  if (parsed.auth) {
    console.log(parsed.username); // "admin"
    console.log(parsed.password); // "secret123"
  }
  
  console.log(parsed.port); // "8080" (Type: string | undefined)
  console.log(parsed.path); // "v1/users" (Type: string | undefined)
}
```

## Structure

The project relies on interface inheritance and declaration merging across multiple files to maintain a fluent API while keeping files small.

- `/src/core/builder.ts`: Contains the foundational `RegexBuilder` class and compilation logic.
- `/src/core/types.ts`: Centralized types and the core interface extended by modular syntax files.
- `/src/syntax/*.ts`: Modular implementation files attaching prototype methods (e.g., `alternation.ts`, `boundaries.ts`, `quantifiers.ts`).
- `/src/index.ts`: The main entry point.
- `/tests/*.test.ts`: Categorized behavioral and static type tests.

## Development Workflow

1. Use `bun run test` for running the isolated test suite.
2. Use `bun run lint` to enforce formatting and style.
3. Use `bun run build` to output common module formats into the `dist/` directory using `tsup`.

## Testing

| Module | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: |
| `src/core/builder.ts` | 100.00 | 100.00 | |
| `src/index.ts` | 100.00 | 100.00 | |
| `src/syntax/alternation.ts` | 100.00 | 100.00 | |
| `src/syntax/boundaries.ts` | 100.00 | 100.00 | |
| `src/syntax/character-classes.ts` | 100.00 | 100.00 | |
| `src/syntax/flags.ts` | 100.00 | 100.00 | |
| `src/syntax/groups.ts` | 100.00 | 100.00 | |
| `src/syntax/lookarounds.ts` | 100.00 | 100.00 | |
| `src/syntax/quantifiers.ts` | 100.00 | 97.33 | 134 (Lazy quantifier verification hook) |
| `src/utils/escape.ts` | 100.00 | 100.00 | |
| **All files** | **100.00** | **99.87** | |

---

## License

This project is licensed under the [MIT License](LICENSE). (Semua milik allah - Aldi Taher)
