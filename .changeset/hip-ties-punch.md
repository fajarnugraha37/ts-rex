---
"@fajarnugraha37/ts-rex": minor
---

fix: address ESLint warnings and enhance type safety

This Commit resolves 72 ESLint warnings identified during the build process.

- Core Types: Replaced unsafe {} type declarations with Record<string, never> in builder.ts to satisfy @typescript-eslint/no-empty-object-type.
- Generic Refinement: Upgraded generic constraints from any to unknown across the core builder and syntax extensions for tighter type-safe inference.
- Implementation Cleanup: Removed unnecessary as any casts in syntax extensions. Where internal prototype flexibility is required, targeted eslint-disable comments were added to keep the public API clean.
- Dead Code Removal: Cleaned up unused imports and handled unused parameters in internal validation methods.