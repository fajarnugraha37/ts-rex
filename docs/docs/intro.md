---
sidebar_position: 1
title: Introduction
---

# What is TS-Rex? Architecture, entities, and concepts

TS-Rex uses AST generation, phantom types, and immutable chaining to infer named capture group types at compile time with zero runtime overhead.

TS-Rex is a zero-dependency TypeScript library that lets you construct complex regular expressions through a chainable API and automatically infers the exact shape of named capturing groups at compile time. Instead of writing opaque regex strings and manually casting match results, you chain human-readable methods — and TypeScript knows the type of every capture before you run a single line.

The library was built to eliminate three classes of bugs that plague native `RegExp` usage: silent type mismatches on named captures, `lastIndex` mutation bugs introduced by the global flag, and malformed patterns caused by unescaped special characters. TS-Rex solves all three through its architecture, not through runtime checks.

## Why TS-Rex?

Native JavaScript `RegExp` is powerful but fragile. Regex patterns are opaque strings — one typo silently breaks your logic. Named capture groups require manual type casting. Global flag mutations cause subtle `lastIndex` bugs across executions. TS-Rex solves all three problems.

| Feature                   | Description                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| **Static type inference** | Named captures are inferred directly from your builder chain — no type assertions needed.    |
| **Stateless execution**   | Fresh `RegExp` instances on every `.exec()` call prevent `lastIndex` mutation bugs entirely. |
| **Automatic escaping**    | `.literal()` and `.anyOf()` auto-escape special characters so your patterns are always safe. |
| **Zero dependencies**     | Built entirely on standard TypeScript and native `RegExp` — nothing extra to install.        |

## Key features

| Feature                   | Description                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static type inference** | Named captures are inferred directly from your builder chain at compile time. No type assertions, no `as string`, no surprises.              |
| **Stateless execution**   | Every `.exec()` call creates a fresh `RegExp` instance, making global-flag iteration safe and free of `lastIndex` bugs.                      |
| **Automatic escaping**    | `.literal()` and `.anyOf()` auto-escape special characters. You cannot accidentally inject a malformed pattern through these methods.        |
| **Immutable builder**     | Every method call returns a new `RegexBuilder` instance. You can safely branch a base pattern into multiple variations without side effects. |
| **Deep optionality**      | Quantifiers like `.optional()` and `.zeroOrMore()` automatically mark inner capture types as `string \| undefined` in the result.            |
| **Zero dependencies**     | Built entirely on standard TypeScript and native `RegExp`. Nothing extra is installed at runtime.                                            |

## Core entities

To use TS-Rex effectively, you work with four objects that form a pipeline from pattern definition to typed match result.

- **`rx()`** is the factory function that initializes a fresh, empty builder. Every pattern starts here.
- **`RegexBuilder`** is the immutable builder class. It exposes dozens of chainable, strictly-typed methods — `.literal()`, `.digit()`, `.capture()`, `.optional()`, `.or()`, and more. Each method appends an AST node internally and returns a new instance, carrying accumulated type state forward in its generic parameters.
- **`CompiledRegex`** is the object returned by calling `.compile()` on a finished builder. It exposes:
  - `pattern` — the raw string representation of the compiled regex
  - `native` — the native JavaScript `RegExp` instance for inspection and interop
  - `exec(string)` — the type-safe extractor that returns a `MatchResult`
- **`MatchResult`** is the discriminated union returned by `.exec()`. On failure it is `{ isMatch: false, match: null }`. On success it is `{ isMatch: true, match: string, ...yourCaptures }`. When the `.global()` flag is set, `.exec()` returns an `IterableIterator` of successful matches instead.

The `MatchResult` discriminant lets TypeScript narrow the type automatically inside an `if (result.isMatch)` block, giving you direct access to all capture properties without extra assertions.

## Architecture pillars

TS-Rex is built on four architectural decisions that work together to deliver both safety and zero runtime cost.

- **AST generation.** Instead of concatenating strings that can silently become malformed, every chained method appends a typed AST node to an internal array. The pattern string is only assembled once, when you call `.compile()`.
- **Immutability.** Each method call creates and returns a completely new `RegexBuilder` instance. This means you can save a base pattern into a variable and extend it multiple times without unintended side effects.
- **Phantom type state.** As you chain methods like `.capture()`, `.optional()`, or `.or()`, TypeScript infers and records the resulting group names and their optionality in the builder’s generic parameters. This type tracking happens entirely at compile time, with zero runtime memory overhead.
- **Runtime compilation.** Calling `.compile()` collapses the AST into a native JavaScript `RegExp` instance, binds the execution-context flags, and returns a strictly typed `CompiledRegex` wrapper with stateless `.exec()` semantics.

Because the builder is immutable, you can compose reusable sub-patterns — build a `domainChars` or `protocol` builder once and reference it in multiple larger patterns without copying or re-declaring it.

## Get started in 3 steps

1. **Install the package**
   ```bash
   npm install @fajarnugraha37/ts-rex
   ```
2. **Build a pattern**
   ```typescript
   import { rx } from "@fajarnugraha37/ts-rex";
   const pattern = rx()
     .capture("firstName", rx().oneOrMore(rx().wordChar()))
     .whitespace()
     .capture("lastName", rx().oneOrMore(rx().wordChar()))
     .compile();
   ```
3. **Execute with full type safety**
   ```typescript
   const result = pattern.exec("John Doe");
   if (result.isMatch) {
     console.log(result.firstName); // "John" — typed as string
     console.log(result.lastName); // "Doe" — typed as string
   }
   ```

## Auto-escaping and safety

TS-Rex enforces automatic escaping on all character inputs. If you call `.literal('http://')`, the library escapes the special characters for you. If you call `.anyOf('a-z')`, the result is `[a\-z]` — matching the literal characters “a”, ”-”, and “z” — not the range `[a-z]`.

To compose character ranges safely, use the type-safe builder methods:

```typescript
const myClass = rx()
  .range("a", "z")
  .or(rx().range("A", "Z"))
  .or(rx().range("0", "9"))
  .or(rx().anyOf(".-"));
// Compiles to: (?:(?:(?:[a-z]|[A-Z])|[0-9])|[.\-])
```

Do not attempt to inject raw regex strings into builder methods. The verbosity of explicit composition is intentional — it guarantees syntactic safety. If you need to bypass escaping, use the `.raw()` or `.rawClass()` escape hatches only when strictly necessary.

## Explore the docs

- **Character classes**: `.digit()`, `.wordChar()`, `.anyOf()`, `.range()`, and more.
- **Quantifiers**: `.optional()`, `.zeroOrMore()`, `.oneOrMore()`, `.times()`, and lazy variants.
- **Groups & alternation**: Named captures, non-capturing groups, backreferences, and `.or()`.
- **Flags**: Global iteration, case-insensitive, match indices, Unicode sets, and more.
- **URL parser example**: A real-world example combining captures, optionality, and character classes.
- **Escape hatches**: `.raw()` and `.rawClass()` for power users who need full control.
