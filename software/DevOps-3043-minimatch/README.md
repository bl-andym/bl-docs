# DevOps 3043 – Dependency Re-resolution & Minimatch Fix

## Key Outcome

The minimatch vulnerability was resolved without overrides by re-resolving the dependency graph. This was achieved by removing the existing install state (`node_modules` and lockfile) and allowing npm to rebuild the full dependency tree using standard semver (MAJOR.MINOR.PATCH) rules.

This process selected patched versions naturally and exposed multiple underlying dependency and configuration issues across the frontend toolchain (Storybook, Sanity, Vite, Vitest), all of which were subsequently resolved.

In addition, the work established a clear dependency resolution strategy, demonstrating the trade-offs between workaround-based fixes and full dependency graph resolution.

---

## Documents

- **minimatch-fix-summary** → what was done and why  
- **minimatch-sanity-rationale** → explanation of the changes and their technical justification  
- **minimatch-sanity-storybook-evidence** → validation and proof of resolution  
- **Follow-on Fixes** → issues exposed during dependency re-resolution and their resolutions 
### Supporting Documents

- **dependency-resolution-strategy.md**  
  → outlines the three possible approaches (proper fix, containment, workaround) and their consequences  

- **devops-3034-post-minimatch.md**  
  → details the additional dependency and tooling issues exposed and resolved after the initial minimatch fix  

- **visual-editing-csm-rationale**
  →  package `@sanity/visual-editing-csm` was installed to resolve a runtime module resolution error in the web application
  
- **main.ts-getAbsolutePath**
  → Storybook previously used getAbsolutePath(...) to force workspace-local package resolution in the monorepo. That workaround masked a mismatch between where Storybook was executed from and where its dependencies were installed.

- **cache-condition-technical-rationale**
  → The intent is performance optimisation: if a cached `node_modules` tree exists, CI skips `npm ci` and reuses the restored dependency tree. That approach is risky for dependency security work because it allows CI to validate against cached installed packages instead of forcing the dependency tree to be rebuilt from `package-lock.json`.

---

## Flow

Summary → Rationale → Evidence → Follow-on Fixes → Supporting Documents

---

## The fault chain was:

minimatch vulnerability alert  
→ dependency cleanup + clean npm re-resolution  

### Storybook / Workspace Resolution
→ Storybook packages upgraded and aligned to 10.3.5  
→ module resolution mismatch exposed  
→ dependencies made root-resolvable and exact-pinned  

### Sanity / CMS Alignment
→ Sanity dependency graph unified and aligned  
→ missing dependency resolved  

### Vite / React / Test Runtime
→ Vite ecosystem drift exposed  
→ dependency versions aligned  
→ Vitest runtime failure surfaced  
→ test environment corrected  

---

## Dependency Resolution Strategy

Three approaches were identified:

- **Proper fix (chosen)**  
  → clean install and full dependency graph resolution  
  → result: stable and consistent system  

- **Containment fix**  
  → force patched dependency via overrides  
  → result: locally safe but globally inconsistent  

- **Hack/workaround**  
  → bypass dependency resolution rules (`--legacy-peer-deps`, forced installs, patching)  
  → result: appears fixed but hides underlying issues  

The chosen approach ensured that all incompatibilities were surfaced and resolved, rather than deferred.

---

## Validation

- npm install completes without dependency conflicts  
- npm ls shows a consistent dependency tree  
- npm run check passes:
  - TypeScript (`tsc --noEmit`)
  - Linting (`eslint`)
  - Formatting (`prettier`)
  - Tests (`vitest`)  
- Frontend verified  
- CMS (Sanity v5.22.0) operational  
- Storybook (v10.3.5) operational  

---

## Key Principle

Allow the dependency graph to resolve naturally wherever possible.

Avoid overrides and workarounds unless absolutely necessary, as they can mask underlying incompatibilities and introduce long-term instability.

---

## Why these changes matter

- Eliminates hidden dependency conflicts  
- Aligns all tooling (Storybook, Sanity, Vite, Vitest)  
- Stabilises CI as a reliable verification step  
- Provides a repeatable approach for resolving future dependency issues  
- Documents both the resolution process and the strategic decision-making behind it  