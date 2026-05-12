---
sidebar_position: 1
title: API Reference Character Classes & Escapes
description: Complete reference for TS-Rex character class and escape methods, including digit, wordChar, anyOf, range, hex, and unicodeProperty.
---

# Character Classes and Escapes — TS-Rex API Reference

Reference for TS-Rex character class and escape methods: `.digit()`, `.wordChar()`, `.anyOf()`, `.range()`, `.hex()`, `.unicodeProperty()`, and more.

TS-Rex provides a method for every JavaScript character class and escape sequence, so you can express any character-matching pattern through a readable, composable builder chain rather than raw regex syntax. Every method returns a new `RegexBuilder` instance — the original is never mutated.

## Common Character Classes

These methods map directly to JavaScript’s standard regex character class tokens.

### `anyChar()`
`anyChar(): RegexBuilder<TCaptures, TFlags>`

Matches any single character except line terminators. Maps to `.`.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

const pattern = rx().anyChar().compile();
pattern.exec('a').isMatch; // true
pattern.exec('\n').isMatch; // false — line terminators are excluded
```

To match newlines as well, chain `.dotAll()` before `.compile()`. This sets the `s` flag, which makes `.` match every character including `\n`.

### `digit()`
`digit(): RegexBuilder<TCaptures, TFlags>`

Matches any digit from 0–9. Maps to `\d`.

```typescript
const pattern = rx().oneOrMore(rx().digit()).compile();
pattern.exec('42').match; // "42"
pattern.exec('abc').isMatch; // false
```

### `notDigit()`
`notDigit(): RegexBuilder<TCaptures, TFlags>`

Matches any character that is not a digit. Maps to `\D`.

```typescript
const pattern = rx().oneOrMore(rx().notDigit()).compile();
pattern.exec('abc').match; // "abc"
```

### `wordChar()`
`wordChar(): RegexBuilder<TCaptures, TFlags>`

Matches any alphanumeric character from the basic Latin alphabet, including the underscore (`[a-zA-Z0-9_]`). Maps to `\w`.

```typescript
const pattern = rx()
  .capture('name', rx().oneOrMore(rx().wordChar()))
  .compile();

const result = pattern.exec('hello_world');
if (result.isMatch) {
  result.name; // "hello_world"
}
```

### `notWordChar()`
`notWordChar(): RegexBuilder<TCaptures, TFlags>`

Matches any character that is not a word character. Maps to `\W`.

```typescript
const pattern = rx().notWordChar().compile();
pattern.exec(' ').isMatch; // true
pattern.exec('a').isMatch; // false
```

### `whitespace()`
`whitespace(): RegexBuilder<TCaptures, TFlags>`

Matches a single whitespace character (spaces, tabs, newlines, etc.). Maps to `\s`.

```typescript
const pattern = rx()
  .capture('first', rx().oneOrMore(rx().wordChar()))
  .whitespace()
  .capture('second', rx().oneOrMore(rx().wordChar()))
  .compile();

const result = pattern.exec('foo bar');
if (result.isMatch) {
  result.first;  // "foo"
  result.second; // "bar"
}
```

### `notWhitespace()`
`notWhitespace(): RegexBuilder<TCaptures, TFlags>`

Matches a single character that is not whitespace. Maps to `\S`.

```typescript
const pattern = rx().oneOrMore(rx().notWhitespace()).compile();
pattern.exec('hello world').match; // "hello"
```

## Character Sets

Use these methods to match or exclude an explicit set of characters, or to match characters within a contiguous range.

### `anyOf(chars)`
`anyOf(chars: string): RegexBuilder<TCaptures, TFlags>`

Matches any one of the characters in `chars`. Maps to `[...]`.
- **chars** (string, required): A string of characters to include in the character class. Special regex characters are automatically escaped.

```typescript
const pattern = rx().anyOf('aeiou').compile();
pattern.exec('hello').match; // "e"
```

`anyOf` auto-escapes all characters in the input string. Passing `'a-z'` does not create a range — it matches the literal characters `a`, `-`, and `z`. Use `.range('a', 'z')` to match a contiguous range.

### `noneOf(chars)`
`noneOf(chars: string): RegexBuilder<TCaptures, TFlags>`

Matches any character that is not in `chars`. Maps to `[^...]`. The `chars` string is auto-escaped identically to `anyOf`.
- **chars** (string, required): A string of characters to exclude. Special regex characters are automatically escaped.

```typescript
const pattern = rx().oneOrMore(rx().noneOf('0123456789')).compile();
pattern.exec('abc123').match; // "abc"
```

### `range(start, end)`
`range(start: string, end: string): RegexBuilder<TCaptures, TFlags>`

Matches any character whose code point falls within `[start, end]` (inclusive). Maps to `[start-end]`. Both arguments must be exactly one character.
- **start** (string, required): The first character in the range. Must be a single character.
- **end** (string, required): The last character in the range. Must be a single character.

```typescript
const lowercase = rx().range('a', 'z');
const uppercase = rx().range('A', 'Z');
const digits    = rx().range('0', '9');

// Compose ranges with .or() to build complex classes safely
const alphanumeric = lowercase
  .or(uppercase)
  .or(digits);

const pattern = rx()
  .capture('slug', rx().oneOrMore(alphanumeric))
  .compile();
```

To combine multiple ranges into a single character class (equivalent to `[a-zA-Z0-9]`), chain them with `.or()`. The library compiles this to a nested alternation that behaves identically to the combined class.

## Named Control Characters

These methods let you insert control characters into your pattern by name, avoiding hard-to-read escape sequences in source code.

### `nullChar()`
`nullChar(): RegexBuilder<TCaptures, TFlags>`

Matches a NUL character (U+0000). Maps to `\0`.

### `newline()`
`newline(): RegexBuilder<TCaptures, TFlags>`

Matches a line feed character (U+000A). Maps to `\n`.

### `carriageReturn()`
`carriageReturn(): RegexBuilder<TCaptures, TFlags>`

Matches a carriage return character (U+000D). Maps to `\r`.

```typescript
// Match Windows-style line endings
const crlf = rx().carriageReturn().newline().compile();
```

### `tab()`
`tab(): RegexBuilder<TCaptures, TFlags>`

Matches a horizontal tab character (U+0009). Maps to `\t`.

```typescript
// Match tab-separated values
const pattern = rx()
  .capture('key', rx().oneOrMore(rx().wordChar()))
  .tab()
  .capture('value', rx().oneOrMore(rx().notWhitespace()))
  .compile();
```

### `verticalTab()`
`verticalTab(): RegexBuilder<TCaptures, TFlags>`

Matches a vertical tab character (U+000B). Maps to `\v`.

### `formFeed()`
`formFeed(): RegexBuilder<TCaptures, TFlags>`

Matches a form feed character (U+000C). Maps to `\f`.

### `controlChar(char)`
`controlChar(char: string): RegexBuilder<TCaptures, TFlags>`

Matches a control character specified by its corresponding letter. Maps to `\cX` where `X` is the uppercase letter.
- **char** (string, required): A single ASCII letter A–Z (case-insensitive). Any other value throws an error.

```typescript
// Match Ctrl-M (carriage return)
const pattern = rx().controlChar('M').compile();
```

## Unicode and Hex Escapes

### `hex(nn)`
`hex(nn: string): RegexBuilder<TCaptures, TFlags>`

Matches a character by its 2-digit hexadecimal code. Maps to `\xNN`.
- **nn** (string, required): A 2-digit hexadecimal string (e.g., `'41'` for A). Throws if the string is not exactly two hex digits.

```typescript
// Match the letter 'A' via its hex code 0x41
const pattern = rx().hex('41').compile();
pattern.exec('A').isMatch; // true
```

### `unicodeChar(nnnn)`
`unicodeChar(nnnn: string): RegexBuilder<TCaptures, TFlags>`

Matches a character by its 4-digit Unicode hex value. Maps to `\uNNNN`.
- **nnnn** (string, required): A 4-digit hexadecimal string (e.g., `'0041'` for A). Throws if the string is not exactly four hex digits.

```typescript
// Match the copyright symbol ©
const pattern = rx().unicodeChar('00A9').compile();
pattern.exec('©').isMatch; // true
```

### `unicodeCodePoint(nnnn)`
`unicodeCodePoint(nnnn: string): RegexBuilder<TCaptures, TFlags>`

Matches a Unicode code point using the brace notation. Maps to `\u{NNNN}`. Requires the `u` or `v` flag to be active.
- **nnnn** (string, required): A 1-to-6-digit hexadecimal string representing the code point (e.g., `'1F600'` for 😀). Throws if the string is not a valid hex sequence of 1–6 digits.

```typescript
// Match the grinning face emoji
const pattern = rx()
  .unicodeCodePoint('1F600')
  .unicode()
  .compile();

pattern.exec('😀').isMatch; // true
```

### `unicodeProperty(prop)`
`unicodeProperty(prop: string): RegexBuilder<TCaptures, TFlags>`

Matches any character that belongs to the given Unicode category or property. Maps to `\p{P}`. Requires the `u` or `v` flag.
- **prop** (string, required): A Unicode property name or value (e.g., `'Letter'`, `'Script=Greek'`, `'Emoji'`).

```typescript
// Match any Unicode letter
const pattern = rx()
  .oneOrMore(rx().unicodeProperty('Letter'))
  .unicode()
  .compile();

pattern.exec('café').match; // "café"
```

### `notUnicodeProperty(prop)`
`notUnicodeProperty(prop: string): RegexBuilder<TCaptures, TFlags>`

Matches any character that does not belong to the given Unicode property. Maps to `\P{P}`. Requires the `u` or `v` flag.
- **prop** (string, required): A Unicode property name or value.

```typescript
// Match any character that is not an ASCII digit
const pattern = rx()
  .oneOrMore(rx().notUnicodeProperty('ASCII_Hex_Digit'))
  .unicode()
  .compile();
```
