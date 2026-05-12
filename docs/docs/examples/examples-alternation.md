---
sidebar_position: 3
title: Example: Alternation with .or()
description: Explore how to use alternation in TS-Rex with the .or() method. Understand how the type system models mutual exclusivity with union types.
---

# Alternation and partial union types with .or()

Alternation means “match this pattern or that pattern.” In raw regex you write `a|b`. In TS-Rex you chain `.or(otherBuilder)`. What makes TS-Rex’s approach distinctive is that the type system models the mutual exclusivity of the two branches: if branch A matched, branch B’s captures are `undefined`, and vice versa. This is represented by wrapping both sides in `Partial`.

## A basic alternation

The simplest case has each branch containing a single named capture.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture('a', rx().literal('A'))
  .or(rx().capture('b', rx().literal('B')))
  .compile();

const result = pattern.exec('A');

if (result.isMatch) {
  // TypeScript knows both 'a' and 'b' might be undefined
  console.log(result.a); // "A"
  console.log(result.b); // undefined
}
```

The compiled pattern is `(?:(?<a>A)|(?<b>B))`. At runtime, a match against `'A'` populates `a` and leaves `b` as `undefined`. A match against `'B'` does the opposite.

## How .or() computes the type

The `.or()` method signature on `RegexBuilder` is:

```typescript
or<OtherCaptures>(
  builder: RegexBuilder<OtherCaptures, OtherFlags>
): RegexBuilder<Partial<TCaptures> & Partial<OtherCaptures>, TFlags>
```

Both sides are wrapped in `Partial`. This is the correct model because the regex engine can only take one branch at a time — you cannot know at compile time which branch succeeded, so all captures from both branches become optional (`string | undefined`).

After an `isMatch` check you still have to narrow further if you want to treat a specific capture as definitely present:

```typescript
if (result.isMatch) {
  if (result.a !== undefined) {
    // result.a is string here
    console.log('Matched branch A:', result.a);
  } else if (result.b !== undefined) {
    // result.b is string here
    console.log('Matched branch B:', result.b);
  }
}
```

## Building character ranges with .or()

`.or()` is also the correct way to compose character class alternatives when you need type-safe range composition. The auto-escaping rules mean you cannot inject raw range syntax like `a-z` into `.anyOf()` — instead you chain `.range().or()`.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Composes to: (?:(?:(?:[a-z]|[A-Z])|[0-9])|[.\-])
const alphanumericAndDot = rx()
  .range('a', 'z')
  .or(rx().range('A', 'Z'))
  .or(rx().range('0', '9'))
  .or(rx().anyOf('.-'));
```

Because none of these intermediate builders contain `.capture()`, all `TCaptures` states are `Record<never, never>` and the resulting `Partial` wrapping has no visible effect on the final type. The composition is purely structural.

## A more complex alternation with multiple branches

You can chain `.or()` more than once to build multi-branch alternations. Each call wraps the accumulated left side in `Partial` again.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .capture('hex', rx().literal('#').oneOrMore(rx().range('0', '9').or(rx().range('a', 'f'))))
  .or(
    rx().capture('rgb', rx().literal('rgb(').oneOrMore(rx().digit()).literal(')'))
  )
  .or(
    rx().capture('named', rx().oneOrMore(rx().wordChar()))
  )
  .compile();

const result = pattern.exec('#ff0000');

if (result.isMatch) {
  // All three captures are string | undefined
  console.log(result.hex);   // "#ff0000"
  console.log(result.rgb);   // undefined
  console.log(result.named); // undefined
}
```

The inferred type of the success branch is:

```typescript
{
  isMatch: true;
  match: string;
  hex?: string;
  rgb?: string;
  named?: string;
}
```

> **Note:** The compiled regex for `.or()` uses non-capturing group wrapping: `(?:left|right)`. The outer group ensures the alternation is properly delimited when other tokens follow.

## Narrowing after .or()

Since all captures from an alternation are `string | undefined`, you narrow them the same way you would any optional property in TypeScript — a simple inequality check against `undefined`.
