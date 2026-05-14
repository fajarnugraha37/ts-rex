---
"@fajarnugraha37/ts-rex": major
---

perf(core): resolve execution engine architectural traps and edge cases

This changes addresses several critical architectural edge cases and V8 performance traps identified in the execution engine. While the previous monomorphic implementation successfully eliminated object spread overhead, it introduced subtle issues with enumerability, potential singleton state poisoning, and constructor bottlenecks. This update hardens the engine for absolute correctness while restoring execution speed to the native floor.

Architectural Fixes & Enhancements:
- **Robust AST-Based Extraction**: Capture group names are now extracted recursively directly from the AST nodes instead of executing a regex against the final compiled pattern string. This eliminates the risk of false positives if a user manually injects raw strings that happen to look like capture groups.
- **Eager Monomorphic Assignment**: Replaced the `Object.defineProperty` lazy prototype getters with eager property assignment inside the dynamic class constructor. This avoids V8's severe performance penalty for dynamic descriptor manipulation on the hot path. Furthermore, this ensures all capture groups are fully enumerable, making them perfectly compatible with object spread operators (`...`) and `JSON.stringify`.
- **Safe Failure Paths**: Removed `Object.freeze()` from the failure results. Freezing objects alters their Hidden Class in V8, breaking inline caching and destroying performance. To prevent state poisoning by the user without sacrificing speed, failure states now instantiate fresh, unfrozen instances of the shared monomorphic class.
- **Global Zero-Length Guard**: Implemented an explicit guard in the global iterator to prevent infinite loops when a pattern matches an empty string (e.g., `.*?` or `\b`). The guard correctly advances the `lastIndex`, including proper handling for Unicode surrogate pairs when unicode flags are active.
- **Indices Caching**: The `indices` getter now caches its mapped object upon initial access, preventing redundant memory allocations if the user accesses the property multiple times.

Documentation Updates:
- Updated `README.md` and benchmark logs to accurately reflect the shift from Lazy Prototype Getters to Eager Monomorphic Classes.
- Added explicit disclaimers regarding the Node.js benchmark anomaly, clarifying that instances where the wrapper appears faster than native execution are specific JIT optimization artifacts rather than universal baseline claims.

