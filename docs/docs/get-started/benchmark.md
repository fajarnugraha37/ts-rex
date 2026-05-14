---
sidebar_position: 3
title: Benchmark
description: The benchmark results comparing our library against native `/pattern/.exec()` execution, and details the architectural decisions made to minimize the abstraction tax
---

# Benchmarking the Type-Safe Regex Builder

When building a type-safe wrapper around native JavaScript `RegExp`, the primary concern is runtime overhead. Our goal is to shift regex validation to compile-time (via TypeScript) while keeping the runtime execution as close to raw native performance as possible.

This document outlines the benchmark results comparing our library against native `/pattern/.exec()` execution, and details the architectural decisions made to minimize the abstraction tax. We ran these benchmarks across two different JavaScript runtimes: Bun and Node.js v24.

## 1. Performance Baseline: Library vs Native

We benchmarked the execution path across four complexity levels. The tables below show the execution time and memory allocation per iteration for our current implementation compared to raw native `RegExp`.

### Results on Bun (v1.3.13)

| Complexity Level          | Library Execution     | Native Raw RegExp Baseline |
| :------------------------ | :-------------------- | :------------------------- |
| **Simple** (No captures)  | ~45 ns / ~0 bytes     | ~46 ns / ~0 bytes          |
| **Medium** (Email parser) | ~650 ns / ~0 bytes    | ~224 ns / ~0 bytes         |
| **Complex** (URL parser)  | ~511 ns / ~9 bytes    | ~295 ns / ~0 bytes         |
| **Extremely Complex**     | ~7.58 µs / ~181 bytes | ~0.24 µs / ~1.6 bytes      |

### Results on Node.js (v24.14.0)

| Complexity Level          | Library Execution    | Native Raw RegExp Baseline |
| :------------------------ | :------------------- | :------------------------- |
| **Simple** (No captures)  | ~104 ns / ~129 bytes | ~99 ns / ~128 bytes        |
| **Medium** (Email parser) | ~355 ns / ~488 bytes | ~220 ns / ~384 bytes       |
| **Complex** (URL parser)  | ~59 ns / ~80 bytes   | ~297 ns / ~528 bytes       |
| **Extremely Complex**     | ~391 ns / ~504 bytes | ~246 ns / ~400 bytes       |

_Note: Native execution only returns the raw `RegExpExecArray`. The library returns a strongly-typed object mapping capture groups to properties. Interestingly, On Node.js, the Complex scenario shows the library outperforming the raw native baseline. We treat this as a workload-specific result rather than a universal claim. The likely cause is V8's ability to optimize the monomorphic result wrapper and avoid some allocation patterns associated with raw `RegExpExecArray` usage._

While there is an observable overhead (especially on complex regexes in Bun), it is largely measured in nanoseconds across both runtimes. The library achieves this by implementing several engine-level optimization techniques.

## 2. Architectural Decisions & Optimizations

To bridge the gap between a fluent builder pattern and raw execution speed, we focused on how JavaScript engines (like V8) handle object allocation and hidden classes.

## B. Specialized Result Objects Instead of Proxies

After discarding the Proxy approach, the next question was how to expose typed capture groups without making the result object unnatural to use.

A prototype-getter based implementation was able to defer capture access lazily, but it had an ergonomic problem: capture groups lived on the prototype, not as own enumerable properties. That means operations like object spread, `Object.keys()`, or `JSON.stringify()` did not behave like users would expect from a normal result object.

The current implementation takes a more pragmatic path.

During `.compile()`, the library extracts capture group names from the builder AST, not from the final regex string. This avoids false positives from raw regex text and keeps capture metadata tied to the structured builder representation.

```ts id="z13ilr"
const groupNames = Array.from(new Set(this._extractCaptureNames(this.chunks)));
```

For regexes with named captures, the compiler creates a specialized result constructor for that compiled regex. When a match succeeds, capture values are assigned directly as own enumerable properties:

```ts id="6wttsr"
this.isMatch = true;
this.match = raw[0];

for (let i = 0; i < groupNames.length; i++) {
  const name = groupNames[i];
  this[name] = raw.groups[name];
}
```

This is no longer fully lazy for capture groups, but it gives the result object normal JavaScript semantics:

```ts id="kc1gau"
result.domain
Object.keys(result)
{ ...result }
JSON.stringify(result)
```

all behave as users would expect.

The trade-off is deliberate: instead of optimizing only for the narrow `result.domain` access case, the library optimizes for predictable runtime behavior and plain-object ergonomics.

---

## C. Simple Fast Path

For patterns without named capture groups and without the `hasIndices` flag, the library skips the custom result constructor entirely.

```ts id="8j1tiy"
const isSimpleFastPath = groupNames.length === 0 && !hasIndices;
```

In this path, execution returns a minimal result object:

```ts id="6x3w2k"
const match = internalNative.exec(str);

return match
  ? { isMatch: true, match: match[0] }
  : { isMatch: false, match: null };
```

This is why simple no-capture regexes can approach raw native execution speed.

---

## D. Safe Global Iteration

Global regexes are stateful because `RegExp.exec()` mutates `lastIndex`.

The library avoids sharing a single global regex instance across iterators. Instead, each global execution creates an isolated `RegExp` clone inside the generator closure:

```ts id="qakzri"
const iterInstance = new RegExp(pattern, flags);
```

The current implementation also includes a zero-length match guard. This matters because global regexes that match an empty string can otherwise loop forever.

```ts id="jat2wa"
if (match[0].length === 0) {
  if (isUnicode && iterInstance.lastIndex < str.length) {
    iterInstance.lastIndex +=
      str.codePointAt(iterInstance.lastIndex)! > 0xffff ? 2 : 1;
  } else {
    iterInstance.lastIndex++;
  }
}
```

This is a correctness-focused trade-off. The library chooses predictable global iteration behavior over sharing a mutable native regex instance.

---

## E. Lazy Cached Indices

The `hasIndices` flag is more expensive because it exposes positional metadata for the full match and named groups.

Instead of eagerly materializing the `indices` object every time a match succeeds, the library creates a getter and caches the computed indices object on first access.

```ts id="4z64s7"
let cachedIndices: any = undefined;

Object.defineProperty(this, "indices", {
  get() {
    if (cachedIndices !== undefined) return cachedIndices;
    // build indices object once
    cachedIndices = result;
    return cachedIndices;
  },
  enumerable: true,
});
```

This keeps normal match execution cheaper when users do not need index metadata, while avoiding repeated allocation when they access `result.indices` multiple times.

## Conclusion

Building a type-safe regex wrapper inherently requires mapping native arrays to typed objects, which carries a small abstraction cost. By pre-computing execution paths, leveraging monomorphic object initialization, and utilizing eager assignments within static shapes, we reduce this tax to a few nanoseconds.
In most common scenarios, the overhead is measured in nanoseconds. However, the Bun extremely-complex case exposes a remaining optimization target, likely around generated pattern shape, capture access strategy, or JavaScriptCore-specific object allocation behavior.
