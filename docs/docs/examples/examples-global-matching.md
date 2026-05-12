---
sidebar_position: 2
title: Example - Global Matching & Iteration
description: Learn how to use the .global() flag in TS-Rex to iterate over all matches in a string safely and statelessly.
---

# Global matching and stateless iteration in TS-Rex

Use `.global()` in TS-Rex to iterate over all matches in a string. The `exec()` method returns a stateless `IterableIterator` — no `lastIndex` bugs.

> **Documentation Index**
>
> Fetch the complete documentation index at: [https://mintlify.com/fajarnugraha37/ts-rex/llms.txt](https://mintlify.com/fajarnugraha37/ts-rex/llms.txt)
>
> Use this file to discover all available pages before exploring further.

When you add `.global()` to a TS-Rex builder, you are telling the pattern to scan the entire input and yield every match, not just the first one. TS-Rex models this at the type level: the return type of `exec()` shifts from the `MatchResult` discriminated union to an `IterableIterator<SingleMatch<TCaptures, TFlags>>`. You iterate over it with a standard `for...of` loop — no index tracking, no `lastIndex` management.

## The digit example

The README’s canonical global example extracts every number from a sentence.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture('num', rx().oneOrMore(rx().digit()))
  .global()
  .compile();

const results = pattern.exec('I have 3 apples and 42 bananas');

for (const result of results) {
  console.log(result.num); // "3", then "42"
}
```

`results` is an `IterableIterator`. Each yielded value is a `SingleMatch` object with `isMatch: true` (always), `match: string`, and every named capture inferred as `string`. There is no failure branch inside the iterator — if the underlying regex finds no matches at all the iterator simply yields nothing.

## How .global() changes the return type

Without `.global()`, `exec()` returns:

```typescript
SingleMatch<TCaptures, TFlags> | FailedMatch<TCaptures, TFlags>
```

After `.global()`, `exec()` returns:

```typescript
IterableIterator<SingleMatch<TCaptures, TFlags>>
```

TypeScript enforces this at compile time. If you call `.global()` the compiler will not let you access `.isMatch` on the outer result — it is an iterator, not a union. The individual items you pull from the iterator do carry `isMatch: true` and all named captures as non-optional strings.

## Stateless execution: no lastIndex bugs

The classic pitfall with native `RegExp` and the `g` flag is `lastIndex`. A stateful regex object remembers where it stopped and resumes from that position on the next call. If you reuse the same `RegExp` instance across multiple `exec()` calls, you get confusing gaps and missed matches.

TS-Rex eliminates this entirely. Every call to `exec()` creates a **fresh `RegExp` instance** internally. The `lastIndex` of the native pattern always starts at `0`, so calling `exec()` on the same compiled pattern multiple times on the same string always returns the same full set of matches.

```typescript
const pattern = rx()
  .capture('num', rx().digit())
  .global()
  .compile();

const text = '1 2 3';

// First run
const firstRun = Array.from(pattern.exec(text));
console.log(firstRun.length); // 3

// Second run on the SAME compiled instance
// With native RegExp + g flag this would return 0 matches.
// With TS-Rex it returns 3 matches again — always.
const secondRun = Array.from(pattern.exec(text));
console.log(secondRun.length); // 3
```

> [!NOTE]
> The same stateless guarantee applies to the `y` (sticky) flag. Each `exec()` call starts from index `0` regardless of how many times you have called `exec()` before.

## Contrast with native RegExp

Here is how the same operation looks with a raw `RegExp` and why it trips up developers:

```typescript
// Native RegExp — stateful, requires caution
const re = /(\d+)/g;
const m1 = re.exec('3 apples and 42 bananas');
console.log(m1?.[1]); // "3"

const m2 = re.exec('3 apples and 42 bananas');
console.log(m2?.[1]); // "42" (picks up where it left off)

// If you now call re.exec() on a *different* string without resetting lastIndex,
// you may start mid-string or get null even when there are matches.
re.lastIndex = 0; // must remember to do this manually
```

TS-Rex never exposes `lastIndex` to you. The compiled `pattern.native` property gives you access to the underlying `RegExp` for inspection, but all actual matching goes through the `exec()` wrapper which handles fresh instantiation internally.

## Combining .global() with .withIndices()

You can layer flags. Adding `.withIndices()` (the `d` flag) alongside `.global()` injects an `indices` property on each yielded match, giving you the `[start, end]` tuple for every captured group.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture('word', rx().oneOrMore(rx().wordChar()))
  .global()
  .withIndices()
  .compile();

const results = pattern.exec('hello world');

for (const result of results) {
  console.log(result.word);           // "hello", then "world"
  console.log(result.indices.word);    // [0, 5], then [6, 11]
  console.log(result.indices.match);   // [0, 5], then [6, 11]
}
```

The `indices` property is typed as `Record<keyof TCaptures, [number, number]> & { match: [number, number] }`, so TypeScript knows exactly which group names are available as index keys.

> [!TIP]
> If you only need to check whether a string contains any match and do not need the captured values, you can use `compiled.native.test(str)` — the native `RegExp` instance is always available via `compiled.native`. For full type-safe iteration, `exec()` remains the recommended path.
