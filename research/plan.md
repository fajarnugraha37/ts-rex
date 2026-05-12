# Implementation Plan: Typesafe Regex Builder (Drizzle Inspired)

## Background & Motivation
The goal is to create a TypeScript regular expression builder that mimics the "magic" of Drizzle ORM. Developers often struggle with complex regex syntax and extracting data from capturing groups safely. By utilizing a fluent builder pattern and advanced TypeScript generics, we can provide a type-safe API for constructing regular expressions and, crucially, inferring the exact shape of the matched capturing groups at compile time, eliminating runtime casting and errors. This library aims for **100% ECMAScript (ES2024) standard compliance**.

## Core Architectural Rules (from gemini.md)
1. **Type Branding (`entityKind`)**: Uses `Symbol.for('regex:entityKind')` to ensure nominal type integrity and prevent structural collisions.
2. **Immutable Builder**: Every method must return a new instance with the updated state type. Zero runtime state mutation.
3. **State Accumulation**: Pass accumulated capture groups and flags via Generics (`TCaptures`, `TFlags`) to statically record the history of function calls.
4. **Phantom Properties**: Store type metadata in `declare _` to ensure zero runtime memory overhead.
5. **Strict Type-Safety**: Runtime output (`.exec()`) must strictly match the compile-time inferred type.
6. **Strict Modularity**: Split logic into composable modules. Max 300 LOC per file.
7. **Zero Dependencies**: Pure TypeScript and native `RegExp`.

## Proposed Solution: AST-based Group Inference
Similar to Drizzle ORM, the builder will not attempt to validate the raw output string literal via TypeScript. Instead, it will use generics to track the "state" of the builder—specifically, a record of the named capturing groups defined in the chain, as well as the active regex flags.
For example, `RegexBuilder<{ id: string, name: string | undefined }, { global: false, indices: false }>` tracks that the resulting execution will yield an object with an `id` and an optional `name`. 
At runtime, the builder will compile these steps into a native JavaScript `RegExp` object and map the `exec()` results back into the inferred object shape.

**Crucial Constraint**: Anonymous indexed capturing groups `(x)` are strictly disallowed in the API. All captured data must be explicitly named to ensure the return type is a reliable `Record<string, string>`.

## Implementation Phases

### Phase 1: Core Architecture & Nominal Typing
1. **Setup Type Branding & Phantom Properties**:
   - Define `entityKind` symbol.
   - Setup base types using `declare _` for storing the capture group shapes and flags without runtime overhead.
2. **Define the Immutable `RegexBuilder` Class/Interface**:
   - Generic state tracking: `class RegexBuilder<TCaptures extends Record<string, any>, TFlags extends Record<string, boolean>>`.
   - Ensure every method returns a cloned instance with updated arrays/state.
3. **Implement the AST/Chunk Engine**:
   - Create an internal mechanism to store regex "chunks" (strings/AST nodes) at runtime that will be concatenated during compilation via a centralized `chainPattern` method.
4. **Compilation Step**:
   - Implement a `.build()` or `.compile()` method that joins the AST chunks and applies accumulated flags into a native `RegExp` instance.

### Phase 2: Core Syntax & Quantifiers
*(Refer to `mapping.md` for specific method names)*
1. **Character Classes, Control Chars & Escapes**:
   - Implement literal escaping and classes: `literal(str)`, `digit()`, `word()`, `whitespace()`, `anyChar()`.
   - Implement explicit control chars: `newline()`, `tab()`, `carriageReturn()`, `nullChar()`, `verticalTab()`, `formFeed()`, `controlChar(X)`.
   - Implement Hex/Unicode code points: `hex(NN)`, `unicodeChar(NNNN)`, `unicodeCodePoint(NNNN)`.
   - Implement ES2018+ Unicode Property Escapes: `unicodeProperty()`, `notUnicodeProperty()`.
2. **Quantifiers**:
   - Implement non-mutating quantifier methods: `.zeroOrMore()`, `.oneOrMore()`, `.optional()`, `.times(n)`, `.between(min, max)`.
   - Implement `.lazy()` to modify the previous quantifier to be non-greedy.
3. **Boundaries**:
   - Implement: `startOfInput()`, `endOfInput()`, `wordBoundary()`.

### Phase 3: Grouping, Lookarounds & Logic
1. **Non-Capturing Groups**:
   - Implement `.group(builder)` to allow nesting patterns.
2. **Named Capturing Groups (The Magic)**:
   - Implement `.capture<Name>(name, builder)`.
   - TypeScript logic: Merge the new capture key into the `TCaptures` generic using intersection/mapped types.
   - Implement `.optionalCapture<Name>(name, builder)` adding the key as `string | undefined`.
3. **Backreferences**:
   - Implement `.matchPrevious<Name>(name)`.
   - TypeScript logic: Ensure the generic constraint enforces that `Name` extends `keyof TCaptures`.
4. **Lookarounds**:
   - Implement `.lookahead()`, `.negativeLookahead()`, `.lookbehind()`, `.negativeLookbehind()`.
5. **Logic (Disjunction)**:
   - Implement `.or(builder)` as a chainable method rather than a variadic `choice(...args)` to prevent TypeScript recursion depth limits and ensure clean union type calculations for captures.

### Phase 4: Flags & Type-Safe Execution Wrapper
1. **Flags API**:
   - Implement fluent flags: `.global()`, `.ignoreCase()`, `.multiline()`, `.dotAll()`, `.unicode()`, `.unicodeSets()` (ES2024 `v` flag), `.sticky()`, `.withIndices()`.
   - Update `TFlags` generic appropriately.
2. **Type Extraction Utilities**:
   - Create `InferMatch<typeof builder>` to extract the `TCaptures` record.
   - Adjust the extraction type based on `TFlags` (e.g., if `.global()` is used, return `IterableIterator<TCaptures>`).
3. **Execution Logic**:
   - Implement `.exec(string)` on the builder.
   - Run the compiled `RegExp`, extract the `groups` property, and return it typed strictly based on `TCaptures` and `TFlags`.

## Verification
- **Type Tests**: Write `.test-d.ts` (using tools like `expect-type` or `tsd` concepts) to assert TypeScript inference, specifically checking that `.matchPrevious()` rejects invalid group names, `.or()` properly unions capture properties, and `.exec()` handles flags correctly.
- **Unit Tests**: Standard unit tests to verify native `RegExp` generation, lazy quantifiers, backreferences, ES2024 features, and `exec()` mapping correctness.