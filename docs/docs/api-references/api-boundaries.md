---
sidebar_position: 2
title: Boundary Assertions
---

# Boundary Assertions — TS-Rex API Reference

Reference for TS-Rex boundary and assertion methods: `.startOfInput()`, `.endOfInput()`, `.wordBoundary()`, and `.nonWordBoundary()`. All are zero-width assertions.

Boundary assertions are zero-width positions in the input string — they consume no characters but constrain where a match can occur. TS-Rex exposes four positional assertions that map directly to JavaScript’s regex boundary tokens. These methods are often the first and last calls in a builder chain, anchoring the pattern to the start or end of the string, or to the edges of a word.

### `startOfInput()`
`startOfInput(): RegexBuilder<TCaptures, TFlags>`

Asserts that the match must begin at the start of the input string. Maps to `^`. When the `.multiline()` flag is active, `^` matches at the start of each line rather than only the start of the entire string.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx()
  .startOfInput()
  .oneOrMore(rx().digit())
  .compile();

pattern.exec('42abc').isMatch; // true  — starts with digits
pattern.exec('abc42').isMatch; // false — does not start with digits
```

### `endOfInput()`
`endOfInput(): RegexBuilder<TCaptures, TFlags>`

Asserts that the match must end at the end of the input string. Maps to `$`. When the `.multiline()` flag is active, `$` matches at the end of each line rather than only the end of the entire string.

```typescript
const pattern = rx()
  .oneOrMore(rx().digit())
  .endOfInput()
  .compile();

pattern.exec('42').isMatch;    // true  — ends with digits
pattern.exec('42px').isMatch;  // false — trailing non-digit characters
```

### `wordBoundary()`
`wordBoundary(): RegexBuilder<TCaptures, TFlags>`

Asserts that the current position is a word boundary — a transition between a word character (`\w`) and a non-word character (`\W`), or the start/end of the string adjacent to a word character. Maps to `\b`.

```typescript
// Match the word "cat" but not "catch" or "concatenate"
const pattern = rx()
  .wordBoundary()
  .literal('cat')
  .wordBoundary()
  .compile();

pattern.exec('the cat sat').isMatch;   // true
pattern.exec('catch the ball').isMatch; // false
```

### `nonWordBoundary()`
`nonWordBoundary(): RegexBuilder<TCaptures, TFlags>`

Asserts that the current position is not a word boundary — the inverse of `wordBoundary()`. Maps to `\B`.

```typescript
// Match "cat" only when it appears inside another word
const pattern = rx()
  .nonWordBoundary()
  .literal('cat')
  .nonWordBoundary()
  .compile();

pattern.exec('concatenate').isMatch; // true
pattern.exec('the cat').isMatch;     // false
```

## Combined Example

The most common pattern is to wrap a full expression between `startOfInput()` and `endOfInput()` to ensure the regex matches the entire string rather than a substring. This is especially useful when validating structured input like identifiers, tokens, or formatted values.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Validate a semantic version string: e.g. "1.2.34"
const semver = rx()
  .startOfInput()
  .capture('major', rx().oneOrMore(rx().digit()))
  .literal('.')
  .capture('minor', rx().oneOrMore(rx().digit()))
  .literal('.')
  .capture('patch', rx().oneOrMore(rx().digit()))
  .endOfInput()
  .compile();

const result = semver.exec('1.2.34');

if (result.isMatch) {
  result.major; // "1"  — Type: string
  result.minor; // "2"  — Type: string
  result.patch; // "34" — Type: string
}

semver.exec('1.2.34-beta').isMatch; // false — suffix not allowed
semver.exec('v1.2.34').isMatch;     // false — prefix not allowed
```

Without `startOfInput()` and `endOfInput()`, the pattern will match a substring anywhere in the input. Add both anchors whenever you are validating that the entire input conforms to a format.
