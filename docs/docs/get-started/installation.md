---
sidebar_position: 2
title: Installation Guide
description: Install TS-Rex in your project using npm, pnpm, yarn, or bun. Requires TypeScript 5.0+ for full type-safety.
---

# Install TS-Rex in your TypeScript project today

TS-Rex is published to npm as `@fajarnugraha37/ts-rex`. Install with npm, pnpm, yarn, or bun. Requires TypeScript 5.0 or higher for type inference.

TS-Rex is published to the npm registry as `@fajarnugraha37/ts-rex`. You can install it with any Node.js-compatible package manager. The package ships prebuilt ESM and CJS bundles alongside TypeScript declaration files, so no additional build configuration is required.

## Install the package

Choose your package manager and run the corresponding command:

### npm
```bash
npm install @fajarnugraha37/ts-rex
```

### pnpm
```bash
pnpm add @fajarnugraha37/ts-rex
```

### yarn
```bash
yarn add @fajarnugraha37/ts-rex
```

### bun
```bash
bun add @fajarnugraha37/ts-rex
```

## TypeScript requirement

TS-Rex uses advanced generic type inference features introduced in TypeScript 5.0. The phantom type state tracking and compile-time capture inference rely on these features and will not work correctly with earlier versions.

> [!WARNING]
> TypeScript 5.0 or higher is required. If your project uses an older version, upgrade TypeScript before installing TS-Rex.

You can check your current TypeScript version with:

```bash
npx tsc --version
```

TS-Rex declares TypeScript as a peer dependency in `package.json`:

```json
{
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

## Module formats

The package ships three output formats from the `dist/` directory, so it works in any modern JavaScript environment without extra configuration:

| File | Format | Use case |
| :--- | :--- | :--- |
| `dist/index.mjs` | ESM | Node.js with `"type": "module"`, bundlers (Vite, esbuild, Rollup) |
| `dist/index.cjs` | CJS | Node.js CommonJS, older bundlers |
| `dist/index.d.ts` | Type declarations | TypeScript type checking in all environments |

The `package.json` `exports` field maps these automatically based on your environment:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Import the library

Once installed, import the `rx` factory function to start building patterns. This is the only named export you need for most use cases:

```typescript
import { rx } from '@fajarnugraha37/ts-rex';
```

If you need to reference the builder or result types explicitly in your own type signatures, you can import them alongside `rx`:

```typescript
import { rx, RegexBuilder, CompiledRegex, MatchResult } from '@fajarnugraha37/ts-rex';
```

## Zero runtime dependencies

TS-Rex has no runtime dependencies. The `devDependencies` in `package.json` include build tools (`tsup`, `tsx`), testing utilities (`expect-type`), and linting (`eslint`, `typescript-eslint`) — none of which are bundled into the distributed package.

> [!NOTE]
> Because TS-Rex depends only on native TypeScript and `RegExp`, adding it to your project does not increase your production bundle size beyond the library itself.

## Next steps

* **Quickstart**: Build your first type-safe regex pattern in under five minutes.
* **Core concepts**: Understand the AST engine, immutability, and phantom type state.
