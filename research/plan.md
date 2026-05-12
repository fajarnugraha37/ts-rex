# Implementation Plan: Typesafe Regex Builder (Drizzle Inspired)

## Background & Motivation
The goal is to create a TypeScript regular expression builder that mimics the "magic" of Drizzle ORM. Developers often struggle with complex regex syntax and extracting data from capturing groups safely. By utilizing a fluent builder pattern and advanced TypeScript generics, we can provide a type-safe API for constructing regular expressions and, crucially, inferring the exact shape of the matched capturing groups at compile time, eliminating runtime casting and errors. This library aims for **100% ECMAScript (ES2024) standard compliance**.

## Core Architectural Pillars (Critical Requirements)
To achieve true Drizzle-level type safety and DX, the architecture MUST strictly adhere to the following principles:

1. **Explicit Immutability (No Shared State)**: Every method in the chain MUST return a completely new instance of the builder. The internal AST array of regex chunks must be copied, not mutated. This allows developers to branch regex definitions safely without side effects.
2. **Deep Optionality via Quantifiers**: Quantifiers like `.optional()` or `.zeroOrMore()` do not just append a `?` or `*` to the string. At the type level, they MUST recursively map over the generic state of the preceding chunk/builder and mark all nested named captures as optional (e.g., using `Partial<TCaptures>`). The flawed `.optionalCapture` approach is strictly prohibited.
3. **Alternation Type Merging**: The `.or(builder)` method introduces complex union types. If branch A captures `{ a: string }` and branch B captures `{ b: string }`, the resulting type must reflect mutual exclusivity (e.g., merging into a union type where absent properties might be undefined).
4. **Flag State Tracking (`TFlags`)**: Regex flags radically alter the execution context. The generic signature MUST track flags (e.g., `TFlags extends { global: boolean, hasIndices: boolean }`). If `g` is set, `.exec()` must return an `IterableIterator`. If `d` is set, the returned match objects must contain an `indices` property.
5. **Type Branding (Phantom Data)**: To prevent structural typing collisions (where any object with a `capture` method might be accidentally passed), the builder must use `entityKind` Symbols and phantom properties (`declare _`) to lock the AST nodes and generic metadata strictly to this library.

## Proposed Solution: AST-based Inference
The builder uses generics to track the "state": a record of named capturing groups and active flags.
`RegexBuilder<TCaptures extends Record<string, string>, TFlags extends Record<string, boolean>>`

At runtime, the builder compiles AST steps into a native JavaScript `RegExp` object and maps the `exec()` results back into the inferred object shape.
**Crucial Constraint**: Anonymous indexed capturing groups `(x)` are strictly disallowed. All captured data must be explicitly named to ensure the return type is a reliable `Record<string, string>`.

## Implementation Phases

### Phase 1: Core Architecture & Nominal Typing
1. **Setup Type Branding & Phantom Properties**:
   - Define `entityKind` symbol.
   - Setup base types using `declare _` for storing the `TCaptures` shapes and `TFlags` without runtime overhead.
2. **Define the Immutable `RegexBuilder` Class**:
   - Generic state tracking: `class RegexBuilder<TCaptures, TFlags>`.
   - Implement the immutable chunk engine: Every method constructs a new array of AST nodes `[...this.chunks, newNode]` and returns `new RegexBuilder(...)`.
3. **Compilation Step**:
   - Implement a `.build()` or `.compile()` method that traverses the AST, concatenates the string representation, appends accumulated flags, and instantiates the native `RegExp`.

### Phase 2: Core Syntax, Boundaries & Escapes
*(Refer to `mapping.md` for specific method names)*
1. **Character Classes, Control Chars & Escapes**:
   - Implement literal escaping and classes: `literal(str)`, `digit()`, `word()`, `whitespace()`, `anyChar()`.
   - Implement explicit control chars: `newline()`, `tab()`, `carriageReturn()`, `nullChar()`, `verticalTab()`, `formFeed()`, `controlChar(X)`.
   - Implement Hex/Unicode code points: `hex(NN)`, `unicodeChar(NNNN)`, `unicodeCodePoint(NNNN)`.
   - Implement ES2018+ Unicode Property Escapes: `unicodeProperty()`, `notUnicodeProperty()`.
2. **Boundaries**:
   - Implement: `startOfInput()`, `endOfInput()`, `wordBoundary()`.

### Phase 3: Grouping, Quantifiers & Alternation (The Magic)
1. **Named Capturing & Non-Capturing Groups**:
   - Implement `.capture<Name>(name, builder)`. Merges the new capture key into `TCaptures`.
   - Implement `.group(builder)` for non-capturing nested patterns.
2. **Quantifiers**:
   - Implement non-mutating wrapper quantifier methods: `.zeroOrMore(builder?)`, `.oneOrMore(builder?)`, `.optional(builder?)`, `.times(n, builder?)`, `.between(min, max, builder?)`.
   - **Type Magic**: When a quantifier wraps a builder, the generic type of the wrapped builder's captures must be mapped to `Partial<TCaptures>` at the type level to enforce deep optionality cleanly.
   - Implement `.lazy()` to modify the previous quantifier to be non-greedy.
3. **Alternation (Logic)**:
   - Implement `.or(builder)`.
   - **Type Magic**: Calculates the union of `TCaptures` from the current builder and the passed builder, representing mutual exclusivity.
4. **Lookarounds & Backreferences**:
   - Implement `.lookahead()`, `.negativeLookahead()`, `.lookbehind()`, `.negativeLookbehind()`.
   - Implement `.matchPrevious<Name>(name)`. TypeScript ensures `Name extends keyof TCaptures`.

### Phase 4: Flags & Execution Engine
1. **Flags API**:
   - Implement fluent flags: `.global()`, `.ignoreCase()`, `.multiline()`, `.dotAll()`, `.unicode()`, `.unicodeSets()` (ES2024 `v`), `.sticky()`, `.withIndices()`.
   - Calling these returns a new builder with the `TFlags` generic updated.
2. **Type Extraction Utilities**:
   - Create `InferMatch<typeof builder>`.
   - Logic: If `TFlags['global']` is true, return `IterableIterator<TCaptures>`. If `TFlags['hasIndices']` is true, append `indices` to the returned record. Otherwise, return `TCaptures | null`.
3. **Execution Logic**:
   - Implement `.exec(string)` on the builder.
   - Run the compiled `RegExp`, handle global iteration or single match extraction, map the `groups` property, and return the strongly-typed result conforming perfectly to `TCaptures` and `TFlags`.

## Verification
- **Type Tests**: Write `.test-d.ts` to assert strict immutability, deep optionality mapping, alternation union correctness, and flag-dependent execution returns.
- **Unit Tests**: Standard unit tests to verify native `RegExp` AST compilation and runtime mapping.ptionality mapping, alternation union correctness, and flag-dependent execution returns.
- **Unit Tests**: Standard unit tests to verify native `RegExp` AST compilation and runtime mapping.