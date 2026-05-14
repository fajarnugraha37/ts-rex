---
sidebar_position: 2
title: Quickstart Guide
description: Build your first type-safe regex pattern with TS-Rex. Learn how to install, build, compile, and execute regex in minutes.
---

# Quickstart: build your first TS-Rex pattern

Install TS-Rex, chain builder methods to describe a pattern, call .compile(), and use .exec() to get a fully typed match result in minutes.

TS-Rex turns regex construction into a sequence of typed method calls. You chain builder methods to describe your pattern, call `.compile()` to get a typed execution wrapper, and then call `.exec()` on a string to get a result object whose properties TypeScript already knows. This page walks you through the full workflow from installation to your first match.

### 1. Install the package
Add TS-Rex to your project using your preferred package manager:

```bash
npm install @fajarnugraha37/ts-rex
```

TS-Rex requires TypeScript 5.0 or higher. See the installation page for all package managers and module format details.

### 2. Import the factory function
Import `rx` from the package. This is the only import you need to start building patterns.

```typescript
import { rx } from '@fajarnugraha37/ts-rex';
```

### 3. Chain builder methods
Call `rx()` to create a fresh builder, then chain methods to describe your pattern. Each method returns a new immutable builder carrying the accumulated type state.

```typescript
const pattern = rx()
  .startOfInput()
  .capture('firstName', rx().oneOrMore(rx().wordChar()))
  .whitespace()
  .capture('lastName', rx().oneOrMore(rx().wordChar()))
  .endOfInput()
  .compile();
```

The two `.capture()` calls tell TypeScript that the result will have `firstName` and `lastName` properties of type `string`.

### 4. Execute and access captures
Call `.exec()` on the compiled pattern. Check `result.isMatch` to narrow the type, then access your capture properties directly — no casting required.

```typescript
const result = pattern.exec('John Doe');

if (result.isMatch) {
  // Types are fully inferred from the captures defined above
  console.log(result.firstName); // "John"
  console.log(result.lastName);  // "Doe"
  console.log(result.match);     // "John Doe" (the full match)
}
```

## Global iteration
The `.global()` flag changes the return type of `.exec()` from a single result object to an `IterableIterator`. TS-Rex creates a fresh `RegExp` instance for every execution, so there are no `lastIndex` mutation bugs to worry about.

```typescript
const pattern = rx()
  .capture('num', rx().oneOrMore(rx().digit()))
  .global()
  .compile();

const results = pattern.exec('I have 3 apples and 42 bananas');

for (const result of results) {
  console.log(result.num); // "3", then "42"
}
```

When `.global()` is set, `.exec()` always returns an `IterableIterator` — TypeScript reflects this in the return type automatically based on your builder chain.

## Match indices
The `.withIndices()` flag (the ECMAScript `d` flag) adds an `indices` property to each match result. Each entry contains a `[start, end]` tuple for the full match and for every named capture group.

```typescript
const pattern = rx()
  .capture('val', rx().wordChar())
  .withIndices()
  .compile();

const result = pattern.exec('a');

if (result.isMatch) {
  console.log(result.indices.match); // [0, 1]
  console.log(result.indices.val);   // [0, 1]
}
```

## Alternation and union types
The `.or()` method matches either the pattern built so far or the pattern you pass in. At the type level, it resolves to a union — TypeScript enforces that exactly one branch matched, so capture properties from the other branch are typed as `string | undefined`.

```typescript
const pattern = rx()
  .capture('a', rx().literal('A'))
  .or(rx().capture('b', rx().literal('B')))
  .compile();

const result = pattern.exec('A');

if (result.isMatch) {
  // TypeScript enforces that either 'a' is a string and 'b' is undefined, or vice versa.
  console.log(result.a); // "A"
}
```
