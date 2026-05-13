---
"@fajarnugraha37/ts-rex": minor
---

refactor: Modular Architecture & Robust Type Distribution

This Commit performs a major structural overhaul of the core library to eliminate the "God File" pattern in builder.ts, strictly adhere to the 300 LOC limit, and fix critical type resolution issues for library
consumers.

Core Changes:
1. Decomposition of RegexBuilder:
    - The monolithic class was split. Method declarations now live in their respective src/syntax/ files within standalone interfaces (e.g., QuantifierMethods).
    - Switched from Module Augmentation to Interface Inheritance. This ensures that the generated .d.ts files are flattened and robust, fixing the issue where consumers couldn't see methods like .capture()
        or .compile().
2. Type Centralization:
    - Moved all shared interfaces (ASTNode, MatchResult, SingleMatch, etc.) to src/core/types.ts.
    - decoupled runtime logic from type definitions.
3. Build & Test Stabilization:
    - Fixed SyntaxError in tests by restoring the runtime export of the entityKind symbol.
    - Resolved verbatimModuleSyntax errors by using import type across the codebase.
    - Achieved a 100% clean lint state by properly suppressing internal any usage.

Verification:
- Static Analysis: Confirmed that .d.ts in dist/ contains the full flattened API.
- Unit Tests: bun run test passes with 93/93 tests.
- Build: bun run build completes with 0 errors/warnings.

Impact:
The core builder is now < 150 lines of code. The library is significantly easier to maintain, and the developer experience for consumers is now fully type-safe and stable regardless of the import method.