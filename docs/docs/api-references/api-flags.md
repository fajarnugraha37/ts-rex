---
sidebar_position: 6
title: Regex Execution Flags
---

# Regex Execution Flags — TS-Rex API Reference

Reference for TS-Rex flag methods: `.global()`, `.ignoreCase()`, `.multiline()`, `.dotAll()`, `.withIndices()`, `.unicode()`, `.unicodeSets()`, and `.sticky()`.

Flags modify how the regex engine interprets and executes a pattern. In TS-Rex, flag methods alter the TypeScript return type of `.exec()` through the `TFlags` generic parameter.

## Flag Summary

| Method | Flag letter | TFlags key set | Return type effect |
| :--- | :--- | :--- | :--- |
| `.global()` | `g` | `{ global: true }` | `exec()` returns `IterableIterator<SingleMatch>` |
| `.ignoreCase()` | `i` | `{ ignoreCase: true }` | No change to return type |
| `.multiline()` | `m` | `{ multiline: true }` | No change to return type |
| `.dotAll()` | `s` | `{ dotAll: true }` | No change to return type |
| `.withIndices()` | `d` | `{ hasIndices: true }` | Adds `indices` property to `SingleMatch` |
| `.unicode()` | `u` | `{ unicode: true }` | No change to return type |
| `.unicodeSets()` | `v` | `{ unicodeSets: true }` | No change to return type |
| `.sticky()` | `y` | `{ sticky: true }` | No change to return type |

### `.global()`
Enables global matching. The `g` flag causes `.exec()` to find all non-overlapping matches. At the type level, `MatchResult` changes from `SingleMatch | FailedMatch` to `IterableIterator<SingleMatch>`.

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

### `.ignoreCase()`
Enables case-insensitive matching.

```typescript
const pattern = rx()
  .capture('greeting', rx().literal('hello'))
  .ignoreCase()
  .compile();

const result = pattern.exec('Hello, world!');
if (result.isMatch) {
  console.log(result.greeting); // "Hello"
}
```

### `.multiline()`
Enables multiline mode. Changes the meaning of `^` and `$` to match the start and end of each line.

### `.dotAll()`
Enables dotAll mode. Causes `.anyChar()` (`.`) to match any character including newlines.

### `.withIndices()`
Enables indices mode. Adds a readonly `indices` property to `SingleMatch` containing `[start, end]` tuples for the full match and every named capture group.

```typescript
const pattern = rx()
  .capture('word', rx().oneOrMore(rx().wordChar()))
  .withIndices()
  .compile();

const result = pattern.exec('hello world');

if (result.isMatch) {
  console.log(result.indices.match);  // [0, 5]
  console.log(result.indices.word);   // [0, 5]
}
```

### `.unicode()`
Enables Unicode mode. Required for `.unicodeCodePoint()` and `.unicodeProperty()`.

### `.unicodeSets()`
Enables Unicode sets mode (ES2024). The `v` flag is a superset of `u`, enabling set operations and string literals inside character classes.

### `.sticky()`
Enables sticky mode. Causes the engine to match only at the exact position indicated by `lastIndex`.
