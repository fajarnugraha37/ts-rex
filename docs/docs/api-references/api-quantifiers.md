---
sidebar_position: 4
title: API Reference Quantifiers & Repetition
description: Complete guide to TS-Rex quantifier methods like optional, zeroOrMore, oneOrMore, and how they handle type-safe capture group optionality.
---

# Quantifiers and Repetition — TS-Rex API Reference

Reference for TS-Rex quantifier methods: `.optional()`, `.zeroOrMore()`, `.oneOrMore()`, `.times()`, `.atLeast()`, `.between()`, and `.lazy()` with capture type semantics.

Quantifiers control how many times a pattern is repeated. In TS-Rex, every quantifier wraps a nested `RegexBuilder` — you build the repeatable sub-pattern using the same fluent API, then pass it to the quantifier method. This design lets TypeScript track the optionality of named captures at the type level without any runtime overhead.

When a quantifier allows zero occurrences (`optional`, `zeroOrMore`, or `atLeast(0, ...)` / `between(0, ..., ...)`), any named captures inside the wrapped builder are automatically widened to `string | undefined` in the result type.

### `optional(builder)`

`optional<InnerCaptures, InnerFlags>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>`

Matches the wrapped pattern zero or one times. Maps to `(?:...)?`. At the type level, all captures defined inside `builder` are merged into the outer builder as `Partial<InnerCaptures>`, meaning each captured group becomes `string | undefined`.

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

const pattern = rx()
  .capture("scheme", rx().literal("http").optional(rx().literal("s")))
  .literal("://")
  .capture("host", rx().oneOrMore(rx().wordChar()))
  .compile();

const result = pattern.exec("http://example");

if (result.isMatch) {
  result.scheme; // "http"  — Type: string
  result.host; // "example" — Type: string
}
```

### `zeroOrMore(builder)`

`zeroOrMore<InnerCaptures, InnerFlags>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>`

Matches the wrapped pattern zero or more times (greedy by default). Maps to `(?:...)*`. Like `optional`, all inner captures are typed as `Partial<InnerCaptures>` because the pattern may match zero times.

```typescript
const pattern = rx()
  .capture("prefix", rx().oneOrMore(rx().wordChar()))
  .zeroOrMore(
    rx().literal("-").capture("segment", rx().oneOrMore(rx().wordChar())),
  )
  .compile();

const result = pattern.exec("foo-bar-baz");

if (result.isMatch) {
  result.prefix; // "foo"
  result.segment; // string | undefined — may not have been captured
}
```

### `oneOrMore(builder)`

`oneOrMore<InnerCaptures, InnerFlags>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>`

Matches the wrapped pattern one or more times (greedy by default). Maps to `(?:...)+`. Because the pattern must match at least once, inner captures remain `string` (not widened to `undefined`).

```typescript
const pattern = rx().capture("word", rx().oneOrMore(rx().wordChar())).compile();

const result = pattern.exec("hello");

if (result.isMatch) {
  result.word; // "hello" — Type: string (guaranteed present)
}
```

### `times(n, builder)`

`times<InnerCaptures, InnerFlags>(n: number, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>`

Matches the wrapped pattern exactly `n` times. Maps to `(?:...){n}`. `n` must be a non-negative integer. Inner captures are not widened because the pattern always matches the required count.

- **n** (number, required): The exact number of times to repeat the pattern. Must be a non-negative integer.
- **builder** (RegexBuilder, required): The sub-pattern to repeat.

```typescript
// Match exactly three digits
const pattern = rx().capture("code", rx().times(3, rx().digit())).compile();

const result = pattern.exec("007");

if (result.isMatch) {
  result.code; // "007" — Type: string
}
```

### `atLeast(n, builder)`

`atLeast<N extends number, InnerCaptures, InnerFlags>(n: N, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & (N extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>`

Matches the wrapped pattern at least `n` times. Maps to `(?:...){n,}`. `n` must be a non-negative integer. When `n` is 0, inner captures are widened to `Partial<InnerCaptures>`. When `n` is 1 or more, captures remain `string`.

- **n** (number, required): The minimum number of repetitions. Must be a non-negative integer.
- **builder** (RegexBuilder, required): The sub-pattern to repeat.

```typescript
// At least two word characters — captures are required (string)
const pattern = rx().capture("id", rx().atLeast(2, rx().wordChar())).compile();

const result = pattern.exec("ab");
if (result.isMatch) {
  result.id; // "ab" — Type: string
}

// At least zero — captures become optional
const loose = rx().capture("tag", rx().atLeast(0, rx().wordChar())).compile();

const r2 = loose.exec("hello");
if (r2.isMatch) {
  r2.tag; // "hello" or undefined — Type: string | undefined
}
```

### `between(min, max, builder)`

`between<Min extends number, InnerCaptures, InnerFlags>(min: Min, max: number, builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & (Min extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>`

Matches the wrapped pattern between `min` and `max` times (inclusive). Maps to `(?:...){min,max}`. `min` and `max` must both be non-negative integers, and `min` must not exceed `max`. When `min` is 0, inner captures are widened to `Partial<InnerCaptures>`.

- **min** (number, required): The minimum number of repetitions.
- **max** (number, required): The maximum number of repetitions.
- **builder** (RegexBuilder, required): The sub-pattern to repeat.

```typescript
// Match a PIN of 4 to 8 digits
const pattern = rx()
  .startOfInput()
  .capture("pin", rx().between(4, 8, rx().digit()))
  .endOfInput()
  .compile();

const result = pattern.exec("12345");

if (result.isMatch) {
  result.pin; // "12345" — Type: string
}
```

### `lazy()`

`lazy(): RegexBuilder<TCaptures, TFlags>`

Converts the immediately preceding quantifier from greedy to lazy (non-greedy). Appends `?` to the last quantifier chunk in the AST. `lazy()` must be called directly after a quantifier method.

```typescript
const input = "<b>bold</b> and <i>italic</i>";

// Greedy: matches from first '<' to last '>'
const greedy = rx()
  .literal("<")
  .oneOrMore(rx().anyChar())
  .literal(">")
  .compile();

greedy.exec(input).match; // "<b>bold</b> and <i>italic</i>"

// Lazy: matches the shortest possible span
const lazy = rx()
  .literal("<")
  .oneOrMore(rx().anyChar())
  .lazy()
  .literal(">")
  .compile();

lazy.exec(input).match; // "<b>"
```

## Type-level Optionality Reference

| Method                   | Regex          | Inner captures type                            |
| :----------------------- | :------------- | :--------------------------------------------- |
| `optional(b)`            | `(?:...)?`     | `Partial<InnerCaptures>` (always optional)     |
| `zeroOrMore(b)`          | `(?:...)*`     | `Partial<InnerCaptures>` (always optional)     |
| `oneOrMore(b)`           | `(?:...)+`     | `InnerCaptures` (always required)              |
| `times(n, b)`            | `(?:...){n}`   | `InnerCaptures` (always required)              |
| `atLeast(0, b)`          | `(?:...){0,}`  | `Partial<InnerCaptures>` (optional when n=0)   |
| `atLeast(n, b)` n ≥ 1    | `(?:...){n,}`  | `InnerCaptures` (required)                     |
| `between(0, m, b)`       | `(?:...){0,m}` | `Partial<InnerCaptures>` (optional when min=0) |
| `between(n, m, b)` n ≥ 1 | `(?:...){n,m}` | `InnerCaptures` (required)                     |
