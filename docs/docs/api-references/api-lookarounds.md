---
sidebar_position: 5
title: API Reference Lookahead & Lookbehind
description: Master zero-width lookaround assertions in TS-Rex. Supports nested capture group inference inside lookahead and lookbehind patterns.
---

# Lookahead and lookbehind assertions — TS-Rex API

Lookaround assertions are zero-width checks — they test whether a pattern exists at the current position without consuming any characters. The regex engine evaluates the assertion, then either continues or fails at the same position in the string. This makes them ideal for conditional matching: “match this word only when followed by a colon” or “match this price only when not preceded by a minus sign”. In TS-Rex, all four lookaround methods accept a builder and merge any captures inside the assertion into the outer `TCaptures`, so named groups inside lookarounds are fully typed and accessible on the result.

> **Note**
> Lookarounds are zero-width: they test position but do not advance the match cursor. The text matched by a lookaround assertion is not included in `result.match`, but any named captures defined inside the assertion **are** available on the result.

---

## `.lookahead(builder)`

Asserts that the pattern in `builder` appears immediately after the current position. Emits `(?=...)`. The surrounding pattern matches only when the lookahead succeeds; the matched characters are not consumed.

**Regex equivalent:** `(?=...)`

**Signature**

```typescript
lookahead< InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>
```

**Parameters**

- `builder`: `RegexBuilder<InnerCaptures, InnerFlags>` (required) - The pattern to assert. Captures defined inside this builder are merged into the outer `TCaptures`.

**Example**

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match a word only when it is followed by a colon
const pattern = rx()
  .capture("label", rx().oneOrMore(rx().wordChar()))
  .lookahead(rx().literal(":"))
  .compile();

const result = pattern.exec("name: Alice");

if (result.isMatch) {
  console.log(result.label); // "name"
  console.log(result.match); // "name" — the colon is not consumed
}
```

**Named captures inside lookaheads**
A capture group placed inside a lookahead is still accessible on the result:

```typescript
const pattern = rx()
  .oneOrMore(rx().digit())
  .lookahead(
    rx().literal(".").capture("decimals", rx().oneOrMore(rx().digit())),
  )
  .compile();

const result = pattern.exec("42.5");

if (result.isMatch) {
  console.log(result.match); // "42" — integer part only
  console.log(result.decimals); // "5" — captured inside the lookahead
}
```

---

## `.negativeLookahead(builder)`

Asserts that the pattern in `builder` does **not** appear immediately after the current position. Emits `(?!...)`. The surrounding pattern matches only when the assertion fails to find its pattern at the current position.

**Regex equivalent:** `(?!...)`

**Signature**

```typescript
negativeLookahead< InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>
```

**Parameters**

- `builder`: `RegexBuilder<InnerCaptures, InnerFlags>` (required) - The pattern whose absence is asserted. Captures inside this builder are merged into the outer `TCaptures`.

**Example**

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match "foo" only when NOT followed by "bar"
const pattern = rx()
  .literal("foo")
  .negativeLookahead(rx().literal("bar"))
  .compile();

console.log(pattern.exec("foobar").isMatch); // false
console.log(pattern.exec("foobaz").isMatch); // true
```

---

## `.lookbehind(builder)`

Asserts that the pattern in `builder` appears immediately before the current position. Emits `(?<=...)`. The surrounding pattern matches only when the lookbehind succeeds, and the matched characters behind the current position are not included in `result.match`.

**Regex equivalent:** `(?<=...)`

**Signature**

```typescript
lookbehind< InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>
```

**Parameters**

- `builder`: `RegexBuilder<InnerCaptures, InnerFlags>` (required) - The pattern to assert behind the current position. Captures inside this builder are merged into the outer `TCaptures`.

**Example**

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match a number only when preceded by a dollar sign
const pattern = rx()
  .lookbehind(rx().literal("$"))
  .capture("amount", rx().oneOrMore(rx().digit()))
  .compile();

const result = pattern.exec("$42");

if (result.isMatch) {
  console.log(result.amount); // "42"
  console.log(result.match); // "42" — the $ is not consumed
}
```

> **Warning**
> Lookbehind support (`(?<=...)`) requires a JavaScript engine that implements ES2018 or later. All modern browsers and Node.js 10+ support it, but older environments do not.

---

## `.negativeLookbehind(builder)`

Asserts that the pattern in `builder` does **not** appear immediately before the current position. Emits `(?<!...)`. The surrounding pattern matches only when the lookbehind assertion fails to find its pattern at the current position.

**Regex equivalent:** `(?<!...)`

**Signature**

```typescript
negativeLookbehind< InnerCaptures extends Record<string, unknown>, InnerFlags extends Record<string, boolean>
>(builder: RegexBuilder<InnerCaptures, InnerFlags>): RegexBuilder<TCaptures & InnerCaptures, TFlags>
```

**Parameters**

- `builder`: `RegexBuilder<InnerCaptures, InnerFlags>` (required) - The pattern whose absence behind the current position is asserted. Captures inside this builder are merged into the outer `TCaptures`.

**Example**

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match a number only when NOT preceded by a minus sign
const pattern = rx()
  .negativeLookbehind(rx().literal("-"))
  .capture("value", rx().oneOrMore(rx().digit()))
  .compile();

console.log(pattern.exec("-42").isMatch); // false
console.log(pattern.exec("42").isMatch); // true
```

---

## Combining lookarounds

Lookaheads and lookbehinds can be combined in the same chain to assert conditions on both sides of a match:

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match a word that is preceded by a space and followed by punctuation
const pattern = rx()
  .lookbehind(rx().whitespace())
  .capture("word", rx().oneOrMore(rx().wordChar()))
  .lookahead(rx().anyOf(".,;:!?"))
  .compile();

const result = pattern.exec("Hello, world!");

if (result.isMatch) {
  console.log(result.word); // "world"
}
```
