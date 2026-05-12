---
sidebar_position: 1
title: Core Architecture AST & Immutability
description: Learn about the internal AST engine and immutability architectural pillars that power TS-Rex's regex pattern construction.
---

# How TS-Rex works: AST engine and immutability

TS-Rex builds regex patterns as an abstract syntax tree instead of raw strings, ensuring correctness and enabling safe pattern composition.

TS-Rex is designed around four architectural pillars that work together to make regex construction correct by construction: it never manipulates raw strings during the build phase, every operation produces a fresh builder instance, type state is tracked at the TypeScript compiler level with no runtime cost, and a single `.compile()` call converts the accumulated tree into a native `RegExp`. Understanding these pillars helps you reason about why the API is shaped the way it is and what guarantees it provides.

## AST generation

Every method you call on a `RegexBuilder` appends an `ASTNode` to an internal array called `chunks`. No string concatenation happens at method-call time. This means that intermediate builder values are inert data structures — they cannot produce a malformed pattern mid-chain.

The `ASTNode` interface is minimal by design:

```typescript
// src/core/builder.ts
export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  prefix?: string;
  suffix?: string;
}
```

Each node carries its own `prefix` and `suffix` wrappers alongside optional `children`, which lets composite constructs like groups and quantifiers nest arbitrarily without requiring the pattern builder to understand the shape of its children. For example, `.group()` appends a node with `prefix: '(?:'` and `suffix: ')'`, with the inner builder’s `chunks` passed as `children`:

```typescript
// src/syntax/groups.ts
RegexBuilder.prototype.group = function (builder) {
  return this._chain({
    type: "group",
    prefix: "(?:",
    suffix: ")",
    children: builder.chunks,
  });
};
```

Similarly, `.capture()` writes the group name directly into the prefix:

```typescript
// src/syntax/groups.ts
RegexBuilder.prototype.capture = function (name, builder) {
  return this._chain({
    type: "capture",
    prefix: `(?<${name}>`,
    suffix: ")",
    children: builder.chunks,
  });
};
```

## Immutability

Every method returns a **new** `RegexBuilder` instance rather than mutating the current one. The private `_chain` method is the single point responsible for this:

```typescript
// src/core/builder.ts
_chain<
  NewCaptures extends Record<string, unknown> = TCaptures,
  NewFlags extends Record<string, unknown> = TFlags
>(chunk: ASTNode): RegexBuilder<NewCaptures, NewFlags> {
  return new RegexBuilder<NewCaptures, NewFlags>([...this.chunks, chunk], this._flags);
}
```

`_chain` spreads `this.chunks` into a new array, appends the incoming node, and constructs a brand-new `RegexBuilder` with the result. The original instance is untouched.

This means you can safely branch a base pattern and extend it in multiple directions without one branch contaminating another:

```typescript
import { rx } from "@fajarnugraha37/ts-rex";

const base = rx().startOfInput().capture("protocol", rx().literal("http"));

// These two extensions are fully independent — `base` is unchanged.
const withS = base.optional(rx().literal("s"));
const withSSL = base.literal("s");
```

## Phantom type state

`RegexBuilder` carries two generic parameters, `TCaptures` and `TFlags`, that track accumulated state purely at the TypeScript type level. They exist nowhere at runtime:

```typescript
// src/core/builder.ts
export class RegexBuilder<
  TCaptures extends Record<string, unknown> = DefaultCaptures,
  TFlags extends Record<string, unknown> = DefaultFlags,
> {
  /**
   * Phantom properties to carry type information at compile time
   * without incurring runtime memory overhead.
   */
  declare readonly _: {
    readonly captures: TCaptures;
    readonly flags: TFlags;
  };
  // ...
}
```

The `declare` keyword means the `_` property is type-only — the TypeScript compiler uses it to resolve generics, but the JavaScript runtime never allocates it. Every method signature that changes the capture or flag shape does so by returning a `RegexBuilder` with updated generics. For instance, `.global()` shifts `TFlags` to include `{ global: true }`:

```typescript
// src/core/builder.ts (interface)
global(): RegexBuilder<TCaptures, Omit<TFlags, 'global'> & { global: true }>;
```

And `.capture()` extends `TCaptures` with the new group name:

```typescript
// src/core/builder.ts (interface)
capture<
  Name extends string,
  InnerCaptures extends Record<string, unknown>,
  InnerFlags extends Record<string, unknown>
>(
  name: Name,
  builder: RegexBuilder<InnerCaptures, InnerFlags>
): RegexBuilder<TCaptures & Record<Name, string> & InnerCaptures, TFlags>;
```

The result is that TypeScript knows exactly which named groups exist and whether they are optional, all from reading the chain — no annotations required from you.

## Runtime compilation

Calling `.compile()` is the only moment the AST collapses into a string. The private `_buildPattern` method walks the `chunks` array recursively, concatenating each node’s `prefix`, `value`, children, and `suffix`:

```typescript
// src/core/builder.ts
private _buildPattern(nodes: ASTNode[]): string {
  return nodes
    .map((node) => {
      let result = node.value || '';
      if (node.children) {
        result += this._buildPattern(node.children);
      }
      return (node.prefix || '') + result + (node.suffix || '');
    })
    .join('');
}
```

`compile()` then wraps the pattern in a `CompiledRegex` that contains the raw `pattern` string, the `native` `RegExp` instance, and an `exec` wrapper that creates a **fresh** `RegExp` on every call to avoid `lastIndex` state bugs caused by the `g` and `y` flags:

```typescript
// src/core/builder.ts
compile(): CompiledRegex<TCaptures, TFlags> {
  const pattern = this._buildPattern(this.chunks);
  const flags = this._getFlagsString();

  // One native regex for inspection purposes
  const native = new RegExp(pattern, flags);

  const exec = (str: string): MatchResult<TCaptures, TFlags> => {
    // Fresh instance on every call — guarantees statelessness
    const instance = new RegExp(pattern, flags);
    // ...
  };

  return { pattern, native, exec };
}
```

The `native` property on `CompiledRegex` is provided for inspection (logging, tooling). Use `exec` for actual matching — it is the only stateless path.

## How the pillars interact

1. **You call rx() and chain methods**: Each method call invokes `_chain`, appending an `ASTNode` and returning a new `RegexBuilder`. TypeScript updates `TCaptures` or `TFlags` in the return type automatically.
2. **Intermediate builders are safe to store and reuse**: Because every result is a new instance with an immutable `chunks` array, you can assign any intermediate builder to a variable and branch from it any number of times.
3. **You call .compile()**: `_buildPattern` traverses the AST and produces the final pattern string. A `CompiledRegex` is returned with full type information locked in.
4. **You call exec()**: A fresh `RegExp` is instantiated per call. The result is typed as `SingleMatch<TCaptures, TFlags> | FailedMatch<TCaptures, TFlags>`, or an `IterableIterator` when `.global()` is set.
