---
sidebar_position: 3
title: API Reference Groups & Alternation
description: Documentation for named capture groups, non-capturing groups, and alternation with .or() in TS-Rex.
---

# Groups, Captures, and Alternation — TS-Rex API

Reference for `.capture()`, `.group()`, `.or()`, and `.matchPrevious()` — the TS-Rex methods that structure patterns and shape TypeScript capture group types.

Groups and alternation are the structural backbone of any non-trivial regex. In TS-Rex, these methods do more than emit regex syntax — they directly shape the TypeScript type of the compiled result.

### `.group(builder)`

Wraps the inner pattern in a non-capturing group (`(?:...)`). Captures defined inside the inner builder are merged into the outer `TCaptures`, so they remain accessible on the final result.

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

const pattern = rx()
  .group(
    rx().capture("scheme", rx().literal("http").optional(rx().literal("s"))),
  )
  .literal("://")
  .compile();

const result = pattern.exec("https://example.com");

if (result.isMatch) {
  console.log(result.scheme); // "https" — typed as string
}
```

### `.capture(name, builder)`

Wraps the inner pattern in a named capturing group (`(?<Name>...)`), adding `Record<Name, string>` to `TCaptures`. The `name` argument must be a valid JavaScript identifier.

- **name** (string, required): The capture group name. Must match `/^[a-zA-Z_][a-zA-Z0-9_]*$/`.
- **builder** (RegexBuilder, required): The pattern to capture.

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

const pattern = rx()
  .startOfInput()
  .capture("year", rx().times(4, rx().digit()))
  .literal("-")
  .capture("month", rx().times(2, rx().digit()))
  .literal("-")
  .capture("day", rx().times(2, rx().digit()))
  .endOfInput()
  .compile();

const result = pattern.exec("2024-03-15");

if (result.isMatch) {
  console.log(result.year); // "2024"
  console.log(result.month); // "03"
  console.log(result.day); // "15"
}
```

### `.or(builder)`

Matches either the pattern accumulated so far or the pattern in the passed builder, emitting `(?:left|right)`. At the type level, both `TCaptures` and the inner builder’s captures are converted to `Partial`.

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

const hexDigit = rx()
  .range("0", "9")
  .or(rx().range("a", "f"))
  .or(rx().range("A", "F"));

const pattern = rx()
  .capture("hex", rx().literal("#").oneOrMore(hexDigit))
  .or(rx().capture("named", rx().oneOrMore(rx().wordChar())))
  .compile();

const result = pattern.exec("#ff0000");

if (result.isMatch) {
  if (result.hex !== undefined) {
    console.log(result.hex); // "#ff0000"
  }
}
```

### `.matchPrevious(name)`

Emits a backreference (`\k<name>`) that matches exactly the same text captured by a previously named group. The `name` argument is constrained to `keyof TCaptures`.

- **name** (keyof TCaptures, required): The name of a previously defined capture group.

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

// Match an opening and closing HTML tag with the same name
const pattern = rx()
  .literal("<")
  .capture("tag", rx().oneOrMore(rx().wordChar()))
  .literal(">")
  .zeroOrMore(rx().anyChar())
  .literal("</")
  .matchPrevious("tag")
  .literal(">")
  .compile();

const result = pattern.exec("<div>hello</div>");

if (result.isMatch) {
  console.log(result.tag); // "div"
}
```
