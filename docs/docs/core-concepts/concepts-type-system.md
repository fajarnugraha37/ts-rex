---
sidebar_position: 2
title: Type Inference System
description: Deep dive into how TS-Rex uses phantom generics and TypeScript's type system to infer capture group types at compile time.
---

# How TS-Rex infers capture group types at compile time

TS-Rex uses phantom generics to track captures and flags as you chain methods, producing strongly-typed MatchResult without any type assertions.

TypeScript’s generic type system is the engine behind TS-Rex’s safety guarantees. As you chain methods, the compiler tracks every named capture group you add, every quantifier that makes a group optional, and every flag that changes the execution return type — with no runtime overhead. By the time you call `.compile()`, TypeScript already knows the exact shape of the object that `.exec()` will return. This page explains how each part of that inference works.

## The `TCaptures` generic
`RegexBuilder<TCaptures, TFlags>` starts with an empty `TCaptures` equal to `Record<string, never>` (aliased as `DefaultCaptures`). Every call to `.capture()` intersects a new entry into `TCaptures`:

```typescript
// src/core/builder.ts (interface)
capture<
  Name extends string,
  InnerCaptures extends Record<string, unknown>,
  InnerFlags extends Record<string, unknown>
>(
  name: Name,
  builder: RegexBuilder<InnerCaptures, InnerFlags>
): RegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;
```

The return type adds `Record<Name, string>` — a required `string` property keyed by the literal name you passed. Inner captures from a nested builder are merged in at the same time via `InnerCaptures`. This means the following chain:

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture('firstName', rx().oneOrMore(rx().wordChar()))
  .whitespace()
  .capture('lastName', rx().oneOrMore(rx().wordChar()))
  .compile();
```

produces a `CompiledRegex` whose `exec` return type includes both `firstName: string` and `lastName: string` — visible in your IDE before you run a single test.

## The `TFlags` generic
`TFlags` starts as `Record<string, never>` and grows as you add flags. Each flag method uses an intersection with `Omit` to prevent duplicate keys:

```typescript
// src/core/builder.ts (interface)
global(): RegexBuilder<TCaptures, Omit<TFlags, 'global'> & { global: true }>;
withIndices(): RegexBuilder<TCaptures, Omit<TFlags, 'hasIndices'> & { hasIndices: true }>;
ignoreCase(): RegexBuilder<TCaptures, Omit<TFlags, 'ignoreCase'> & { ignoreCase: true }>;
```

These accumulated flags control the conditional types in `MatchResult`, described below. The actual runtime flag string is assembled separately in `_getFlagsString()` — the TypeScript types and the runtime value are kept in sync but computed independently.

## The `MatchResult` discriminated union
The `exec` method on `CompiledRegex` returns `MatchResult<TCaptures, TFlags>`, which is a conditional type:

```typescript
// src/core/builder.ts
export type MatchResult<TCaptures, TFlags> = TFlags extends { global: true }
  ? IterableIterator<SingleMatch<TCaptures, TFlags>>
  : SingleMatch<TCaptures, TFlags> | FailedMatch<TCaptures, TFlags>;
```

When `TFlags` does not contain `{ global: true }`, the result is a **discriminated union** on the `isMatch` boolean:

```typescript
// src/core/builder.ts
export type SingleMatch<TCaptures, TFlags> = TCaptures & { isMatch: true; match: string } & (TFlags extends { hasIndices: true } ? { readonly indices: Record<keyof TCaptures, [number, number]> & { match: [number, number] } } : Record<string, never>);

export type FailedMatch<TCaptures, TFlags> = { isMatch: false; match: null } & { [K in keyof TCaptures]: undefined } & (TFlags extends { hasIndices: true } ? { readonly indices: undefined } : Record<string, never>);
```

Narrowing with `if (result.isMatch)` gives TypeScript enough information to infer `SingleMatch`, making all capture properties available as `string`. In the `else` branch, TypeScript knows you have `FailedMatch` and all capture properties are `undefined`. You never need to check for `null` on individual groups.

```typescript
const result = pattern.exec('John Doe');

if (result.isMatch) {
  console.log(result.firstName); // string
  console.log(result.match);     // string
} else {
  console.log(result.firstName); // undefined
  console.log(result.match);     // null
}
```

### Global mode: `IterableIterator`
Adding `.global()` shifts `TFlags` to contain `{ global: true }`, which flips `MatchResult` to `IterableIterator<SingleMatch<TCaptures, TFlags>>`. There is no union with `FailedMatch` in this branch — each yielded item is already a successful match:

```typescript
const pattern = rx()
  .capture('num', rx().oneOrMore(rx().digit()))
  .global()
  .compile();

// TypeScript infers: IterableIterator<SingleMatch<{ num: string }, { global: true }>>
const results = pattern.exec('3 apples and 42 bananas');

for (const result of results) {
  console.log(result.num); // "3", then "42"
}
```

### Indices mode: `withIndices`
Adding `.withIndices()` sets `{ hasIndices: true }` in `TFlags`. The conditional inside `SingleMatch` then merges an `indices` object into the result type, giving each group a `[number, number]` tuple:

```typescript
const pattern = rx()
  .capture('val', rx().wordChar())
  .withIndices()
  .compile();

const result = pattern.exec('a');

if (result.isMatch) {
  result.indices.match; // [number, number]
  result.indices.val;   // [number, number]
}
```

## Partial captures from quantifiers and alternation
Not every capture group is guaranteed to be present in a match. TS-Rex models this precisely.

### `.optional()` and `.zeroOrMore()`
Both quantifiers wrap inner captures in `Partial<InnerCaptures>` at the type level:

```typescript
// src/core/builder.ts (interface)
optional<InnerCaptures, InnerFlags>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;

zeroOrMore<InnerCaptures, InnerFlags>(
  builder: RegexBuilder<InnerCaptures, InnerFlags>
): RegexBuilder<TCaptures & Partial<InnerCaptures>, TFlags>;
```

This means that captures inside an `.optional()` wrapper become `string | undefined` in the result, reflecting that the group may simply not participate in a given match.

### `.or()`: mutual exclusivity
`.or()` models alternation where exactly one branch matches. It wraps **both** sides in `Partial`:

```typescript
// src/core/builder.ts (interface)
or<OtherCaptures, OtherFlags>(
  builder: RegexBuilder<OtherCaptures, OtherFlags>
): RegexBuilder<Partial<TCaptures> & Partial<OtherCaptures>, TFlags>;
```

Both the left-hand captures and the incoming builder’s captures become optional in the merged type, because only one branch can win at runtime. You can inspect whichever property is non-`undefined` to determine which branch matched:

```typescript
const pattern = rx()
  .capture('a', rx().literal('A'))
  .or(rx().capture('b', rx().literal('B')))
  .compile();

const result = pattern.exec('A');

if (result.isMatch) {
  // TypeScript: { a?: string; b?: string; isMatch: true; match: string }
  if (result.a !== undefined) {
    console.log('Branch A matched:', result.a);
  } else {
    console.log('Branch B matched:', result.b);
  }
}
```

> **Why does .or() make the left side Partial too?**
> When you write `builderA.or(builderB)`, neither branch is guaranteed to match. The alternation wraps both in a non-capturing group (`(?:...|...)`), and the regex engine picks one. TypeScript has no way to know at the call site which branch will win, so both sides are typed as optional. This is conservative but correct — you always narrow at runtime with an `!== undefined` check.

> **What about .atLeast(0) and .between(0, n)?**
> Both have the same optionality semantics as `.zeroOrMore()`. The type-level condition is checked on the `Min` or `N` generic parameter:
>
> ```typescript
> // src/core/builder.ts (interface)
> atLeast<N extends number, InnerCaptures, InnerFlags>(
>   n: N,
>   builder: RegexBuilder<InnerCaptures, InnerFlags>
> ): RegexBuilder<TCaptures & (N extends 0 ? Partial<InnerCaptures> : InnerCaptures), TFlags>;
> ```
>
> When `n` is the literal `0`, TypeScript resolves the conditional to `Partial<InnerCaptures>`. Any other numeric literal leaves captures required.
