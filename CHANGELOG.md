# @fajarnugraha37/ts-rex

## 1.1.0

### Minor Changes

- f5cb94d: rem: typedoc and migrate to decosaurus
- 78140ee: Completely overhauls the library's documentation by migrating it from a monolithic README to a fully-featured, interactive [Docusaurus](https://docusaurus.io/) website.

  ### Documentation Site

  - **Docusaurus Initialization**: Bootstrapped a modern Docusaurus v3 instance in the `/docs` directory with custom theming and structured sidebars.
  - **Segmented Content Architecture**:
    - **Get Started**: Clean installation instructions and quickstart guides.
    - **Core Concepts**: Deep technical dives into the library's magic: Architecture, Auto-Escaping, and the Type System.
    - **API References**: Exhaustive, modular documentation for Boundaries, Character Classes, Flags, Groups, Lookarounds, and Quantifiers.
    - **Examples**: Dedicated pages for complex real-world use cases (e.g., the Advanced URL Parser and Global Matching).
  - **Visual Assets**: Added rich custom SVG diagrams (`immutability.svg`, `type-inference.svg`, `escaping.svg`, etc.) to visually explain complex TS-Rex mechanics to users.

  ### CI/CD

  - **GitHub Pages Pipeline**: Added `.github/workflows/gp-deploy.yml` to automatically build and deploy the Docusaurus site to GitHub Pages whenever changes are merged into the main branch.

  ***

  **Checklist:**

  - [x] Documentation builds successfully locally (`bun run docs:build` / `bun run docs:serve`)
  - [x] All internal markdown links and sidebars resolve correctly
  - [x] GitHub Actions workflow is correctly configured with required deployment permissions

### Patch Changes

- b342d86: docs: add tsdoc to core type definitions

## 1.0.0

### Major Changes

- c5d97af: enhance regex functionality with new match result types, improved pattern compilation, and comprehensive tests for boundaries, character classes, flags, grouping, quantifiers, and alternation (main func done)

### Minor Changes

- c9d35b2: 1. Centralized Interface: All RegexBuilder interface declarations (which contain method contracts like .digit(), .capture(), etc.) have been moved to src/core/builder.ts. 2. Interface Merging: Because the interface and class have the same name (RegexBuilder) and are in the same file, TypeScript automatically merges them. When built, tsup will generate a single, complete class definition in index.d.ts. 3. Decoupled Implementation: Implementation logic (such as RegexBuilder.prototype.digit = ...) remains in its own files (src/syntax/\*.ts) to maintain code modularity, but the problematic declare module block has been removed. 4. Verified Build: I've run bun run build and verified the contents of dist/index.d.ts. As a result, all methods are now listed directly under the exported RegexBuilder interface. 5. **Power User Escape Hatches**: Added `.raw(str)` and `.rawClass(str)` to the builder. This allows advanced users to bypass the auto-escaping engine when they need to inject exact, unescaped raw regex strings (e.g., specific
  complex ranges). 6. **`.or()` Alternation Fix**: Fixed a critical generic bug where `TCaptures extends DefaultCaptures` inadvertently swallowed nested capturing group types into an empty object `{}`. It now accurately computes mutual exclusivity
  using `Partial<T>`.

  **Checklist:**

  - [x] All 91 unit tests passing (100% Coverage)
  - [x] Linter passing with zero structural errors
  - [x] Tested against a mocked consumer ESM project

- 7f8b503: fix: address ESLint warnings and enhance type safety

  This Commit resolves 72 ESLint warnings identified during the build process.

  - Core Types: Replaced unsafe {} type declarations with Record<string, never> in builder.ts to satisfy @typescript-eslint/no-empty-object-type.
  - Generic Refinement: Upgraded generic constraints from any to unknown across the core builder and syntax extensions for tighter type-safe inference.
  - Implementation Cleanup: Removed unnecessary as any casts in syntax extensions. Where internal prototype flexibility is required, targeted eslint-disable comments were added to keep the public API clean.
  - Dead Code Removal: Cleaned up unused imports and handled unused parameters in internal validation methods.

- 03979ee: : enhance RegexBuilder with flags support, including global, case-insensitive, multiline, dotAll, unicode, sticky, and indices; update related tests and documentation
- 0171b69: feat: implement RegexBuilder class and associated ASTNode structure with initial tests
- de61fbd: enhance RegexBuilder with grouping, quantifiers, alternation, and lookarounds support, including comprehensive tests
- 77e74d7: phase 1 enhance RegexBuilder with additional type safety and testing capabilities
- b9873d2: add boundaries and character classes to RegexBuilder with escaping utilities and tests

### Patch Changes

- 5c01c42: Add documentation sites
- b8d561b: scaffolding: initialize TypeScript project

  - Initialized a TypeScript project with a basic configuration file.
  - Set up a build configuration using tsup for bundling TypeScript and JavaScript files.
  - Add bunfig.toml for configuration and test coverage settings.
  - Create ESLint configuration for TypeScript and prettier integration.

- b767b1d: feat: refine CompiledRegex interface and enhance pattern building in RegexBuilder
- 5bcd883: Updated `README.md` to reflect the new Advanced Examples (using `.range().or()`) and fully documented the internal magic (AST generation & Phantom Types) and the new Escape Hatches.
