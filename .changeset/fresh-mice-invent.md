---
"@fajarnugraha37/ts-rex": minor
---

1. Centralized Interface: All RegexBuilder interface declarations (which contain method contracts like .digit(), .capture(), etc.) have been moved to src/core/builder.ts.
2. Interface Merging: Because the interface and class have the same name (RegexBuilder) and are in the same file, TypeScript automatically merges them. When built, tsup will generate a single, complete class definition in index.d.ts.
3. Decoupled Implementation: Implementation logic (such as RegexBuilder.prototype.digit = ...) remains in its own files (src/syntax/*.ts) to maintain code modularity, but the problematic declare module block has been removed.
4. Verified Build: I've run bun run build and verified the contents of dist/index.d.ts. As a result, all methods are now listed directly under the exported RegexBuilder interface.
5. **Power User Escape Hatches**: Added `.raw(str)` and `.rawClass(str)` to the builder. This allows advanced users to bypass the auto-escaping engine when they need to inject exact, unescaped raw regex strings (e.g., specific
  complex ranges).
6. **`.or()` Alternation Fix**: Fixed a critical generic bug where `TCaptures extends DefaultCaptures` inadvertently swallowed nested capturing group types into an empty object `{}`. It now accurately computes mutual exclusivity
  using `Partial<T>`.
  
**Checklist:**
- [x] All 91 unit tests passing (100% Coverage)
- [x] Linter passing with zero structural errors
- [x] Tested against a mocked consumer ESM project