---
"@fajarnugraha37/ts-rex": minor
---

Completely overhauls the library's documentation by migrating it from a monolithic README to a fully-featured, interactive [Docusaurus](https://docusaurus.io/) website.

### Documentation Site
* **Docusaurus Initialization**: Bootstrapped a modern Docusaurus v3 instance in the `/docs` directory with custom theming and structured sidebars.
* **Segmented Content Architecture**:
    * **Get Started**: Clean installation instructions and quickstart guides.
    * **Core Concepts**: Deep technical dives into the library's magic: Architecture, Auto-Escaping, and the Type System.
    * **API References**: Exhaustive, modular documentation for Boundaries, Character Classes, Flags, Groups, Lookarounds, and Quantifiers.
    * **Examples**: Dedicated pages for complex real-world use cases (e.g., the Advanced URL Parser and Global Matching).
* **Visual Assets**: Added rich custom SVG diagrams (`immutability.svg`, `type-inference.svg`, `escaping.svg`, etc.) to visually explain complex TS-Rex mechanics to users.

### CI/CD
* **GitHub Pages Pipeline**: Added `.github/workflows/gp-deploy.yml` to automatically build and deploy the Docusaurus site to GitHub Pages whenever changes are merged into the main branch.

---
**Checklist:**
- [x] Documentation builds successfully locally (`bun run docs:build` / `bun run docs:serve`)
- [x] All internal markdown links and sidebars resolve correctly
- [x] GitHub Actions workflow is correctly configured with required deployment permissions
