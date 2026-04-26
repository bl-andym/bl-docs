# Rationale: Installing @sanity/visual-editing-csm

## Summary

The package `@sanity/visual-editing-csm` was installed to resolve a runtime module resolution error in the web application caused by a missing dependency required by `next-sanity` visual editing features.

---

## Problem

When running the application:

```bash
npm run dev
```

The following error occurred:

```text
Module not found: Can't resolve '@sanity/visual-editing-csm'
```

### Import trace

```text
next-sanity → @sanity/visual-editing → @sanity/visual-editing-csm
```

This indicated that `@sanity/visual-editing-csm` is a required dependency but was not resolvable at runtime.

---

## Root Cause

- `next-sanity` (v12.x) depends on `@sanity/visual-editing`
- `@sanity/visual-editing` depends on `@sanity/visual-editing-csm`
- This dependency was not explicitly installed in the project
- Previously, it may have been available transitively via nested dependencies
- After dependency re-resolution (minimatch fix + Sanity v5 alignment), npm no longer hoisted or implicitly provided it

---

## Solution

Install the missing dependency explicitly in the web workspace:

```bash
npm install -w @bl-web/web @sanity/visual-editing-csm
```

---

## Why workspace installation

The dependency is required at runtime by the web application:

```text
apps/web → next-sanity → @sanity/visual-editing
```

Installing it in the `@bl-web/web` workspace ensures:

- Correct ownership of the dependency
- Predictable module resolution
- Avoidance of reliance on transitive or hoisted dependencies

---

## Validation

After installation:

```bash
npm ls @sanity/visual-editing-csm
```

Expected result:

- Version `3.x` is used by the active web dependency tree
- Any older versions (e.g. `2.x`) remain isolated in legacy subtrees

Run application:

```bash
npm run dev
```

Expected:

- No module resolution errors
- Visual editing features load correctly

---

## Conclusion

This change ensures that all runtime dependencies required by `next-sanity` visual editing are explicitly declared and resolvable, improving stability and aligning with best practices for dependency management in a monorepo.
