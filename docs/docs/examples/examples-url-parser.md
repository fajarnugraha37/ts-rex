---
sidebar_position: 4
---

# URL parser: composing captures and optionality

A complete URL parsing example with TS-Rex demonstrating nested captures, `.optional()`, character class composition, and strongly-typed results.

> **Documentation Index**
>
> Fetch the complete documentation index at: [https://mintlify.com/fajarnugraha37/ts-rex/llms.txt](https://mintlify.com/fajarnugraha37/ts-rex/llms.txt)
>
> Use this file to discover all available pages before exploring further.

The URL parser is the canonical complex example in TS-Rex. It brings together every major feature — named captures, nested builders, character class composition, `.optional()` wrapping, and alternation — into a single pattern that produces a fully typed result object. Walking through it step by step shows how small, readable builders compose into a production-quality parser.

## The full pattern

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Matches 'http' or 'https'
const protocol = rx().capture('protocol', rx().literal('http').optional(rx().literal('s')));

// Combine ranges and specific characters safely
const alphanumeric = rx()
  .range('a', 'z')
  .or(rx().range('A', 'Z'))
  .or(rx().range('0', '9'));

// Password allows alphanumeric and special characters
const passwordChars = alphanumeric.or(rx().anyOf('!@#$%^&*'));

const auth = rx().capture(
  'auth',
  rx()
    .capture('username', rx().oneOrMore(rx().wordChar()))
    .literal(':')
    .capture('password', rx().oneOrMore(passwordChars))
    .literal('@')
);

// Domain allows lowercase letters, numbers, dot, and hyphen
const domainChars = rx().range('a', 'z').or(rx().range('0', '9')).or(rx().anyOf('.-'));

const urlParser = rx()
  .startOfInput()
  .group(protocol) // non-capturing wrapper around the protocol capture
  .literal('://')
  .optional(auth)
  .capture('domain', rx().oneOrMore(domainChars))
  .optional(
    rx()
      .literal(':')
      .capture('port', rx().oneOrMore(rx().digit()))
  )
  .optional(
    rx()
      .literal('/')
      .capture('path', rx().zeroOrMore(rx().notWhitespace()))
  )
  .endOfInput()
  .compile();

const parsed = urlParser.exec('https://admin:secret123@api.example.com:8080/v1/users');

if (parsed.isMatch) {
  console.log(parsed.protocol); // "https"
  console.log(parsed.domain);   // "api.example.com"
  if (parsed.auth) {
    console.log(parsed.username); // "admin"
    console.log(parsed.password); // "secret123"
  }
  console.log(parsed.port); // "8080"
  console.log(parsed.path); // "v1/users"
}
```

## Walking through each section

1. **Protocol: capture with an optional suffix**
    ```typescript
    const protocol = rx().capture('protocol', rx().literal('http').optional(rx().literal('s')));
    ```
    This captures the full `http` or `https` string into the `protocol` group. The inner `.optional(rx().literal('s'))` makes the `s` optional at the regex level. Because `optional()` wraps a builder that has no captures of its own, the only named group produced here is `protocol: string`.

2. **Character class composition: alphanumeric and password chars**
    ```typescript
    const alphanumeric = rx()
      .range('a', 'z')
      .or(rx().range('A', 'Z'))
      .or(rx().range('0', '9'));
    const passwordChars = alphanumeric.or(rx().anyOf('!@#$%^&*'));
    ```
    These builders carry no captures — they are pure character class patterns. Chaining `.or()` between range builders produces `(?:(?:[a-z]|[A-Z])|[0-9])`, which behaves identically to `[a-zA-Z0-9]` in any regex engine. The `anyOf` call auto-escapes each special character so `!@#$%^&*` is safe to pass as a literal string.

3. **Auth: nested captures inside .optional()**
    ```typescript
    const auth = rx().capture(
      'auth',
      rx()
        .capture('username', rx().oneOrMore(rx().wordChar()))
        .literal(':')
        .capture('password', rx().oneOrMore(passwordChars))
        .literal('@')
    );
    ```
    The `auth` builder nests two captures — `username` and `password` — inside a parent `auth` capture. When you later wrap this entire builder in `.optional(auth)`, TS-Rex applies `Partial` to all three captured fields: `auth`, `username`, and `password` all become `string | undefined` in the result type.

4. **Domain: composing safe character ranges**
    ```typescript
    const domainChars = rx().range('a', 'z').or(rx().range('0', '9')).or(rx().anyOf('.-'));
    ```
    Domain names contain lowercase letters, digits, dots, and hyphens. The `.anyOf('.-')` call auto-escapes the dot and hyphen, producing `[.\-]`. Composed with the ranges, the full alternation covers all valid domain characters without any raw regex injection.

5. **Assembling the final pattern**
    ```typescript
    const urlParser = rx()
      .startOfInput()
      .group(protocol) // non-capturing wrapper around the protocol capture
      .literal('://')
      .optional(auth) // auth, username, password → Partial
      .capture('domain', rx().oneOrMore(domainChars))
      .optional( // port → Partial
        rx().literal(':').capture('port', rx().oneOrMore(rx().digit()))
      )
      .optional( // path → Partial
        rx().literal('/').capture('path', rx().zeroOrMore(rx().notWhitespace()))
      )
      .endOfInput()
      .compile();
    ```
    `.group(protocol)` wraps the protocol builder in a non-capturing group `(?:...)` while still merging its `protocol` capture into the outer type. `.optional(auth)` is what marks `auth`, `username`, and `password` as optional — the `Partial` is applied at the point of the `.optional()` call, not inside the `auth` builder definition itself.

## The result type

After compiling, the `exec()` return type on the success branch is:

```typescript
{
  isMatch: true;
  match: string;
  protocol: string;   // always present — not wrapped in optional()
  domain: string;     // always present
  auth?: string;      // optional — from .optional(auth)
  username?: string;  // optional — nested inside optional auth
  password?: string;  // optional — nested inside optional auth
  port?: string;      // optional — from .optional(port section)
  path?: string;      // optional — from .optional(path section)
}
```

Required captures (`protocol`, `domain`) are typed as `string`. Everything wrapped in `.optional()` — directly or as a nested capture inside an optional group — becomes `string | undefined`.

## Narrowing optional captures

Use a standard truthiness check to narrow optional captures before using them.

```typescript
if (parsed.isMatch) {
  // protocol and domain are always string — no check needed
  const scheme = parsed.protocol;
  const host = parsed.domain;

  // auth is string | undefined — check before using
  if (parsed.auth) {
    // Inside this block, TypeScript still types username and password as
    // string | undefined — narrow each one explicitly if needed
    const user = parsed.username ?? 'anonymous';
    const pass = parsed.password ?? '';
  }

  // port and path follow the same pattern
  const port = parsed.port ? Number(parsed.port) : 443;
  const path = parsed.path ?? '';
}
```

> **Tip**: Compose small, named builders (`protocol`, `auth`, `domainChars`) and then assemble them into the final pattern. This keeps each piece readable on its own, makes the overall pattern self-documenting, and lets you reuse sub-patterns across multiple compiled regexes without duplication.
