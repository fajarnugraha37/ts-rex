---
sidebar_position: 8
title: API Reference Escape Hatches
description: Learn about .raw() and .rawClass(), the power user escape hatches in TS-Rex that allow injecting unescaped regex strings.
---

# Escape Hatches — TS-Rex API Reference

Reference for `.raw()` and `.rawClass()` — the "power user" methods that allow you to bypass TS-Rex's automatic escaping and safety engine.

While TS-Rex is designed to prevent malformed regex patterns through automatic escaping, there are times when you may need to inject raw regex tokens or use experimental features not yet wrapped in the fluent API.

## `.raw<NewCaptures>(str)`

`raw<NewCaptures>(str: string): RegexBuilder<TCaptures & NewCaptures, TFlags>`

Injects the exact string into the pattern without any escaping or validation. This is the ultimate escape hatch.

### Capture Group Registration

If your raw string contains named capture groups, TS-Rex will not detect them automatically. To maintain type safety, you can pass an optional generic parameter `NewCaptures` to "register" these groups in the TypeScript type system.

- **str** (string, required): The raw regex pattern to inject.
- **NewCaptures** (type parameter, optional): A record type defining the named capture groups present in the raw string.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';

// Manually register a capture group named 'userId'
const parser = rx()
  .raw<{ userId: string }>("(?<userId>\\d+)")
  .compile();

const res = parser.exec("123");
if (res.isMatch) {
  // Autocomplete works for 'userId'!
  console.log(res.userId); // "123"
}
```

## `.rawClass(str)`

`rawClass(str: string): RegexBuilder<TCaptures, TFlags>`

Generates a character class `[...]` exactly as typed. It wraps your input in brackets but performs no escaping inside them.

- **str** (string, required): The contents of the character class (e.g., `'a-zA-Z0-9'`).

```typescript
// Create a complex range manually
const pattern = rx()
  .capture('hex', rx().oneOrMore(rx().rawClass('0-9A-Fa-f')))
  .compile();

const res = pattern.exec("deadbeef");
if (res.isMatch) {
  console.log(res.hex); // "deadbeef"
}
```

### When to Use Escape Hatches

- **Performance**: When you have a very complex pre-existing regex pattern you want to reuse.
- **Experimental Features**: Using new regex syntax (like set operations or future proposals) before they are officially supported by TS-Rex methods.
- **Conciseness**: When writing a very long character class that would be too verbose with `.range().or(...)`.

> [!WARNING]  
> Using escape hatches completely bypasses TS-Rex's safety engine. You are responsible for ensuring the injected strings are syntactically valid and properly escaped for their intended context.
