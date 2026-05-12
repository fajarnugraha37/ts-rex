---
sidebar_position: 3
title: Automatic escaping and regex pattern safety
---

# Automatic escaping and regex pattern safety

TS-Rex auto-escapes special regex characters in .literal() and .anyOf(). Learn how escaping works, when it applies, and how to opt out safely.

TS-Rex treats pattern correctness as a first-class concern. When you pass a plain string to methods like `.literal()` or `.anyOf()`, the library escapes every character that carries special meaning in a regular expression before placing it into the AST. This means you can pass user-supplied strings, file paths, or domain names directly into a builder without first running them through a separate sanitization step — the library handles it for you.

## Which methods auto-escape
Auto-escaping is applied by two utility functions defined in `src/utils/escape.ts`:

```typescript
// src/utils/escape.ts
export function escapeLiteral(str: string): string {
  // Escapes characters with special meaning outside character classes
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeClass(str: string): string {
  // Escapes characters with special meaning inside character classes: [ ] \ ^ -
  return str.replace(/[\]\\^-]/g, '\\$&');
}
```

These two functions serve different contexts:

| Method | Escape function | Context |
| --- | --- | --- |
| `.literal(str)` | `escapeLiteral` | Outside a character class |
| `.anyOf(chars)` | `escapeClass` | Inside `[...]` |
| `.noneOf(chars)` | `escapeClass` | Inside `[^...]` |

The implementations in `src/syntax/character-classes.ts` show exactly where each is applied:

```typescript
// src/syntax/character-classes.ts
RegexBuilder.prototype.literal = function (str: string) {
  return this._chain({ type: 'literal', value: escapeLiteral(str) });
};

RegexBuilder.prototype.anyOf = function (chars: string) {
  return this._chain({ type: 'class', value: `[${escapeClass(chars)}]` });
};

RegexBuilder.prototype.noneOf = function (chars: string) {
  return this._chain({ type: 'class', value: `[^${escapeClass(chars)}]` });
};
```

## Escaping in practice: `.anyOf()` and character ranges
The most common point of confusion is `.anyOf()`. Because `escapeClass` escapes the hyphen `-`, passing a range-like string does **not** produce a range:

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

rx().anyOf('a-z').compile().pattern;
// => "[a\\-z]"
// Matches the literal characters 'a', '-', and 'z' — NOT a range.
```

This is intentional. A bare hyphen inside a character class is a special character that the regex engine interprets as a range operator. By escaping it, TS-Rex guarantees that `.anyOf('a-z')` always means “any of these three characters”, regardless of their position in the string.

The same applies to `.literal()`. Passing a URL, file extension, or any string with dots, slashes, or parentheses is safe:

```typescript
rx().literal('https://example.com/path?q=1').compile().pattern;
// => "https://example\\.com/path\\?q=1"
// Every special character is escaped before it enters the AST.
```

## Building character ranges correctly
> **Warning**: Do not attempt to inject range syntax or raw regex strings into `.literal()`, `.anyOf()`, or `.noneOf()`. Any special characters you pass will be escaped and treated as literals, not as regex syntax.

To match a character range, use `.range(start, end)`. To combine multiple ranges or character sets, compose them with `.or()`:

> **Tip**: The correct way to build a character class equivalent to `[a-zA-Z0-9.-]` is to compose individual `.range()` and `.anyOf()` calls using `.or()`:
>
> ```typescript
> const myClass = rx()
>   .range('a', 'z')
>   .or(rx().range('A', 'Z'))
>   .or(rx().range('0', '9'))
>   .or(rx().anyOf('.-'));
> // Compiles to: (?:(?:(?:[a-z]|[A-Z])|[0-9])|[.\-])
> // Behaviorally identical to [a-zA-Z0-9.-] in any regex engine.
> ```

The compiled output is more verbose than hand-written regex, but it is syntactically guaranteed to be correct.

`.range()` validates its arguments and passes them through `escapeClass` as well, ensuring that even unusual boundary characters are handled safely:

```typescript
// src/syntax/character-classes.ts
RegexBuilder.prototype.range = function (start: string, end: string) {
  if (start.length !== 1 || end.length !== 1) {
    throw new Error('Range boundaries must be single characters');
  }
  return this._chain({ type: 'class', value: `[${escapeClass(start)}-${escapeClass(end)}]` });
};
```

## Escape hatches for power users
When you have a known-safe regex fragment that you want to inject directly — for example, a pre-validated pattern from a library or a complex Unicode property expression — TS-Rex provides two methods that bypass auto-escaping entirely.

> **Warning**: Both escape hatches completely bypass TS-Rex’s syntactic safety engine. Passing an invalid or untrusted string through either method can produce a malformed `RegExp` that throws at `.compile()` time or matches incorrectly at runtime. Use them only when you have full control over the injected string.

### `.raw(str)`
Injects the string directly into the AST as a raw value, with no processing:

```typescript
// src/core/builder.ts
raw(str: string): RegexBuilder<TCaptures, TFlags> {
  return this._chain({ type: 'raw', value: str });
}
```

Use `.raw()` when you need to splice in an arbitrary regex fragment — a backreference format, a Unicode script property, or any construct that TS-Rex does not yet expose as a named method.

```typescript
// Inject a raw Unicode script property assertion
rx().raw('\\p{Script=Latin}').unicode().compile().pattern;
// => "\\p{Script=Latin}"
```

### `.rawClass(str)`
Wraps the string in `[...]` without escaping the contents:

```typescript
// src/core/builder.ts
rawClass(str: string): RegexBuilder<TCaptures, TFlags> {
  return this._chain({ type: 'rawClass', value: `[${str}]` });
}
```

This is useful when you want a traditional compact character class and you are confident the contents are valid regex syntax:

```typescript
rx().rawClass('a-zA-Z0-9._-').compile().pattern;
// => "[a-zA-Z0-9._-]"
```

`.raw()` and `.rawClass()` do not affect the `TCaptures` or `TFlags` generic types. They are purely a pattern-string concern — the type system remains fully intact around them.
