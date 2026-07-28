# Post-Minimatch Dependency Changes

## Bird's-eye view

After the initial fixes: - minimatch vulnerability resolved - Sanity
aligned (v5.x) - Storybook aligned (10.3.5)

A secondary fault chain emerged due to tooling misalignment exposed by
clean dependency resolution.

------------------------------------------------------------------------

## Changes Made

### 1. Vite ecosystem alignment

**Problem** - vite@8 with @vitejs/plugin-react@4 incompatibility -
Multiple vite versions across workspaces

**Fix** - Upgraded @vitejs/plugin-react to v6 - Aligned with vite@8

**Outcome** - Peer dependency conflicts removed - Deterministic installs

------------------------------------------------------------------------

### 2. esbuild version reconciliation

**Problem** - Multiple esbuild versions (0.25.x, 0.27.x, 0.28.x)

**Fix** - Installed esbuild@0.28.0 at root - Allowed npm to dedupe
naturally

**Outcome** - Satisfies vite@8 requirements - Stable build tooling

------------------------------------------------------------------------

### 3. Workspace dependency boundary clarification

**Problem** - Mixed root vs workspace dependency ownership

**Fix** - Used workspace installs (-w @bl-web/web)

**Outcome** - Clear dependency boundaries

------------------------------------------------------------------------

### 4. Vitest runtime failure

**Problem** ReferenceError: React is not defined

**Root Cause** - JSX runtime not injected

------------------------------------------------------------------------

### 5. Vitest configuration fix

**File** apps/web/vitest.config.ts

**Fix** - Ensured react() plugin is applied

**Outcome** - JSX transform and runtime restored

------------------------------------------------------------------------

### 6. Test environment stabilisation

**File** apps/web/setupTests.ts

-   React runtime now correctly available
-   Testing Library functioning

------------------------------------------------------------------------

### 7. Full CI pipeline validation

**Command** npm run check

**Validates** - TypeScript - ESLint - Prettier - Vitest

**Outcome** - Full pipeline stable

------------------------------------------------------------------------

### 8. Dependency graph validation

**Command** npm ls vite @vitejs/plugin-react esbuild

**Outcome** - Verified compatible dependency graph

------------------------------------------------------------------------

### 9. Strategic decision

-   Continued fixes despite branch not requiring merge
-   Preserved as reference for dependency fault chains

------------------------------------------------------------------------

## Key Insight

This work evolved from a security fix into a full dependency system
audit.
