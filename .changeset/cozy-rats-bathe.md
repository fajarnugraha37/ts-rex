---
"@fajarnugraha37/ts-rex": patch
---

Rrefactor: System-wide Type Safety Hardening and Documentation Alignment
To addresses several critical discrepancies between the documentation and the implementation, while fundamentally fixing the "type leakage" issue where complex operations were losing capture group metadata.

Core Changes:
1. Type System Refactor (Issue #2 & #5):
    - Removed pervasive any usage in src/syntax/. Methods like .optional(), .zeroOrMore(), and .or() now correctly propagate and transform capture group types (e.g., applying Partial for optionality).
    - Tightened matchPrevious<Name> to strictly require Name extends keyof TCaptures & string, preventing invalid backreferences at compile time.
2. API Consistency (Issue #1 & #3):
    - Removed test() from README.md as it is not currently implemented in the core engine.
    - Updated quantifier documentation to show that the builder parameter is mandatory, matching the implementation.
3. DX Improvements (Issue #4):
    - Updated documentation to highlight that FailedMatch result objects provide undefined for all capture groups, allowing for safer property access patterns.

Verification:
- Static Analysis: Verified that IDE autocomplete correctly infers deep optionality and union types for nested captures.
- Unit Tests: Ran bun run test — all 93 tests passed.

Impact:
Users will now have full type safety when using complex fluent chains, with zero any types breaking the inference chain.
