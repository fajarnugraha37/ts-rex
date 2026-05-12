---
sidebar_position: 5
title: Example - Basic Capturing
description: A simple example of using .capture() to extract data from strings with full TypeScript type safety.
---

# Named capture groups with static type inference

Named capture groups let you label the parts of a regex match and retrieve them by name instead of by numeric index. In TS-Rex, every `.capture()` call you chain onto a builder is recorded at the type level, so by the time you call `.compile()` and then `.exec()`, TypeScript already knows the exact shape of your result — no type assertions, no `as string`, no guessing.

## A simple two-group pattern

The most direct way to see this in action is with a name parser. You build up the pattern by chaining methods, give each group a string identifier, and the result type is inferred automatically.

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
  // TypeScript infers these as `string` — no casting needed
  console.log(result.firstName); // "John"
  console.log(result.lastName);  // "Doe"
  console.log(result.match);     // "John Doe"
}
```

## The MatchResult discriminated union

`exec()` returns a discriminated union on the `isMatch` boolean. Before you access any captured field you must narrow the type with an `isMatch` check. TypeScript enforces this — if you try to read `result.firstName` outside the `if` block, the compiler will warn you that it might be `undefined`.

The two branches of the union are:

| Branch | Shape |
| --- | --- |
| Success | `{ isMatch: true, match: string, firstName: string, lastName: string }` |
| Failure | `{ isMatch: false, match: null, firstName: undefined, lastName: undefined }` |

The failure branch sets every captured field to `undefined`, so you can safely destructure anywhere — as long as you check `isMatch` first.

```typescript
const result = pattern.exec('John Doe');

// Narrowed inside the if block
if (result.isMatch) {
  const { firstName, lastName, match } = result;
  // firstName: string ✓
  // lastName: string ✓
  // match: string ✓
}

// Outside the block — both branches are possible
// result.firstName → string | undefined
```

## What TypeScript infers

You can inspect the inferred type of a compiled pattern’s `exec` return directly. After two `.capture()` calls named `'firstName'` and `'lastName'`, the success branch looks like this:

```typescript
type SuccessBranch = {
  isMatch: true;
  match: string;
  firstName: string;
  lastName: string;
};
```

Each new `.capture('name', builder)` call merges `Record<'name', string>` into the running type state via TypeScript’s intersection types. There is zero runtime overhead — the type accumulation happens entirely at compile time through phantom generic parameters on `RegexBuilder<TCaptures, TFlags>`.

> **Note:** Capture names must be valid JavaScript identifiers. TS-Rex validates names at runtime and throws if you pass something like `'1invalid'` or `'my-group'`. Stick to names you would use as a variable: `camelCase`, `snake_case`, or `PascalCase` all work.

## Richer types from multiple captures

Patterns with more captures produce correspondingly richer result types. Here is a date parser that extracts four named groups:

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const datePattern = rx()
  .startOfInput()
  .capture('year', rx().times(4, rx().digit()))
  .literal('-')
  .capture('month', rx().times(2, rx().digit()))
  .literal('-')
  .capture('day', rx().times(2, rx().digit()))
  .endOfInput()
  .compile();

const result = datePattern.exec('2026-05-12');

if (result.isMatch) {
  // All four fields are inferred as `string`
  console.log(result.year);  // "2026"
  console.log(result.month); // "05"
  console.log(result.day);   // "12"
}

// Inferred success type:
// {
//   isMatch: true;
//   match: string;
//   year: string;
//   month: string;
//   day: string;
// }
```

> **Tip:** All captured values are always `string`, even when the content looks numeric. RegExp capture groups return the matched text as-is. Parse to a number with `Number(result.year)` after the `isMatch` check if needed.

## Nested captures

You can pass a builder that itself contains `.capture()` calls as the second argument to an outer `.capture()`. Both the outer and inner group names are merged into the result type.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture(
    'outer',
    rx()
      .literal('hello')
      .capture('inner', rx().oneOrMore(rx().wordChar()))
  )
  .compile();

// Compiled pattern: (?<outer>hello(?<inner>(?:\w)+))

const result = pattern.exec('helloworld');

if (result.isMatch) {
  console.log(result.outer); // "helloworld"
  console.log(result.inner); // "world"
}

// Inferred success type:
// {
//   isMatch: true;
//   match: string;
//   outer: string;
//   inner: string;
// }
```
