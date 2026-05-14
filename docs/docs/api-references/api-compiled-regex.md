---
sidebar_position: 7
title: API Reference CompiledRegex & exec()
description: Learn about the CompiledRegex interface, the stateless exec method, and the MatchResult discriminated union types.
---

# CompiledRegex Interface and `exec()` — TS-Rex API

Reference for `CompiledRegex` returned by `.compile()`: the `.exec()` method, `.pattern` string, `.native` RegExp, `SingleMatch`, `FailedMatch`, and `MatchResult` types.

`.compile()` is the terminal method that turns your builder chain into a typed execution object. The returned `CompiledRegex` object carries the fully resolved `TCaptures` and `TFlags` types.

## The `CompiledRegex` Interface

```typescript
export interface CompiledRegex<TCaptures, TFlags> {
  pattern: string;
  toRegExp: () => RegExp;
  exec: (str: string) => MatchResult<TCaptures, TFlags>;
}
```

- **pattern** (string): The raw regex pattern string without flag letters.
- **toRegExp** (function): A factory method that creates and returns a fresh native JavaScript `RegExp` instance.
- **exec** (function): The primary execution method. Externally stateless, but internally may reuse a cached `RegExp` instance for performance.

## Stateless Execution Guarantee

TS-Rex eliminates the `lastIndex` bug by ensuring `.exec()` is externally stateless. Internally, single-match execution may reuse a private, cached `RegExp` instance for performance, while explicitly resetting state where needed. Global iteration uses an isolated `RegExp` instance per iterator to avoid cross-iterator state corruption. This means `.exec()` acts as a pure function from the caller's perspective: the same input always produces the same output.

## `MatchResult` Types

`MatchResult` is a discriminated union whose shape is determined by `TFlags`.

```typescript
export type MatchResult<TCaptures, TFlags> =
  TFlags extends { global: true }
    ? IterableIterator<SingleMatch<TCaptures, TFlags>>
    : SingleMatch<TCaptures, TFlags> | FailedMatch<TCaptures, TFlags>;
```

### `SingleMatch<TCaptures, TFlags>`
- **isMatch**: `true`
- **match**: The full matched substring.
- **[capture name]**: One property per named capture group.
- **indices**: Present only when `.withIndices()` was called.

### `FailedMatch<TCaptures, TFlags>`
- **isMatch**: `false`
- **match**: `null`
- **[capture name]**: `undefined`

## Usage Examples

### Basic Single Match with Narrowing
```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .startOfInput()
  .capture('firstName', rx().oneOrMore(rx().wordChar()))
  .whitespace()
  .capture('lastName', rx().oneOrMore(rx().wordChar()))
  .endOfInput()
  .compile();

const result = pattern.exec('John Doe');

if (result.isMatch) {
  console.log(result.firstName); // "John"
  console.log(result.lastName);  // "Doe"
}
```

### Global Iteration
```typescript
const pattern = rx()
  .capture('word', rx().oneOrMore(rx().wordChar()))
  .global()
  .compile();

for (const result of pattern.exec('hello world foo')) {
  console.log(result.word); // "hello", "world", "foo"
}
```

### Match Indices
```typescript
const pattern = rx()
  .capture('key',   rx().oneOrMore(rx().wordChar()))
  .literal('=')
  .capture('value', rx().oneOrMore(rx().notWhitespace()))
  .withIndices()
  .compile();

const result = pattern.exec('lang=TypeScript');

if (result.isMatch) {
  console.log(result.indices.key);    // [0, 4]
  console.log(result.indices.value);  // [5, 15]
}
```
