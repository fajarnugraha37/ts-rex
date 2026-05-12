# TS-Rex

<h1 align="center">
  <a href="https://github.com/fajarnugraha37/ts-rex">
    <picture>
      <img height="500" alt="Drizzle Castor" src="https://raw.githubusercontent.com/fajarnugraha37/ts-rex/refs/heads/main/docs/logo.png">
    </picture>
  </a>
</h1>
<p align="center">
    <em>A TypeScript library for constructing regular expressions using a fluent builder API. It provides compile-time type safety for capturing groups and execution contexts without requiring code generation.</em>
</p>

---

## Features

- **Fluent API**: Chain methods to build regex patterns programmatically.
- **Static Type Inference**: Named capturing groups are automatically inferred as strongly-typed objects at compile time.
- **Stateless Execution**: The `.exec()` wrapper instantiates fresh `RegExp` objects to prevent state mutation bugs associated with the `g` and `y` flags.
- **Deep Optionality**: Quantifiers (`.optional()`, `.zeroOrMore()`) and alternations (`.or()`) correctly map captured properties to `Partial` or union types.
- **Zero Dependencies**: Built entirely on standard TypeScript and native `RegExp`.

## Installation

```bash
# via npm
npm install @fajarnugraha37/ts-rex
bun add @fajarnugraha37/ts-rex
pnpm add @fajarnugraha37/ts-rex
yarn add @fajarnugraha37/ts-rex

# via jsr
bunx jsr add @fajar/ts-rex
npx jsr add @fajar/ts-rex
deno add jsr:@fajar/ts-rex
```

## How It Works

`ts-rex` employs an Abstract Syntax Tree (AST) architecture combined with TypeScript's generic type inference to deliver Drizzle-like "magic."

1. **AST Generation**: Instead of manipulating strings that can easily become malformed, every chained method appends an AST node to an internal array.
2. **Immutability**: Each method call creates and returns a completely new `RegexBuilder` instance. This allows you to safely branch regex definitions (e.g., saving a base pattern into a variable and extending it multiple times) without unintended side effects.
3. **Phantom Type State**: As you chain methods like `.capture()`, `.optional()`, or `.or()`, TypeScript infers and records the resulting group names and optionality within the generic `TCaptures` state. This happens entirely during compilation, imposing **zero** runtime memory overhead.
4. **Runtime Compilation**: Calling `.compile()` collapses the AST into a native JavaScript `RegExp` instance and binds the execution context flags, returning a strict type-safe execution wrapper.

## Core Entities

To effectively use this library, you should understand these core entities:

- `rx()`: The factory function that initializes a fresh, empty builder.
- `RegexBuilder`: The immutable builder class. Exposes dozens of chainable, strictly-typed methods (`.literal()`, `.digit()`, `.capture()`, etc.).
- `CompiledRegex`: The object returned by `.compile()`. It contains:
  - `pattern`: The raw string representation of the regex.
  - `native`: The native JavaScript `RegExp` instance.
  - `test(string)`: A fast, stateless boolean check (`true` / `false`).
  - `exec(string)`: The type-safe extractor method.
- `MatchResult`: The discriminated union returned by `.exec()`. 
  - On failure: `{ isMatch: false, match: null }`
  - On success: `{ isMatch: true, match: string, ...[Your Captures] }`. (If the `.global()` flag is set, this becomes an `IterableIterator` of successful matches).

## Usage

### Basic Capturing

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

Flags dynamically modify the return type of `.exec()`. Using the `.global()` flag changes the result from a single object to an `IterableIterator`.

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

## Test Coverage

The project uses `bun` for dependency management, testing, and building. The library maintains strict **99.87%** test coverage across 91 unit tests testing every syntactic edge case and static type accumulation constraint.

| Module | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: |
| `src\core\builder.ts` | 100.00 | 100.00 | |
| `src\index.ts` | 100.00 | 100.00 | |
| `src\syntax\alternation.ts` | 100.00 | 100.00 | |
| `src\syntax\boundaries.ts` | 100.00 | 100.00 | |
| `src\syntax\character-classes.ts` | 100.00 | 100.00 | |
| `src\syntax\flags.ts` | 100.00 | 100.00 | |
| `src\syntax\groups.ts` | 100.00 | 100.00 | |
| `src\syntax\lookarounds.ts` | 100.00 | 100.00 | |
| `src\syntax\quantifiers.ts` | 100.00 | 97.33 | 134 (Lazy quantifier validation hook) |
| `src\utils\escape.ts` | 100.00 | 100.00 | |
| **All files** | **100.00** | **99.87** | |

```bash
bun install
bun run test
bun run lint
bun run build
```

Tests run via `bun test` and use `expect-type` to assert static generic constraints.

## License

MIT
