# Minimatch & Sanity v5 Fix – Evidence Report

## Minimatch Fix

The minimatch vulnerability has been successfully resolved by allowing the dependency tree to re-resolve cleanly, This was achieved by removing the existing install state and letting npm rebuild the entire dependency graph from scratch using standard semver rules, rather than forcing specific versions.

### Evidence

- `npm ls minimatch` previously showed `minimatch@9.0.6` via the Storybook / glob chain.
- After dependency alignment and reinstall, `npm ls minimatch` shows patched versions such as `minimatch@9.0.9`.
- `npm audit` no longer reports the original minimatch advisory.
- No root `overrides` entry was added for `minimatch`.

---

## Sanity v5 Alignment

First-party Sanity dependencies were aligned to `5.22.0`, which unified the active dependency graph, improved type consistency, and isolated the legacy Q42 Sanity v3 dependency into a contained subtree.

### Evidence

- `npm ls sanity` shows first-party packages resolving to `sanity@5.22.0`.

- Legacy dependency remains isolated:

```
@bl-web/sanity-shared
└─ @q42/sanity-plugin-computed-page-tree@2.2.2
   └─ sanity@3.99.0
```

- `npm run check-types` passes.

---

## Storybook Resolution

The dependency alignment exposed a weakness in Storybook’s module resolution strategy.

### Initial failure

```
Cannot find package '@storybook/react-vite'
Cannot find package '@storybook/react-dom-shim'
```

### Resolution

Storybook dependencies were made root-resolvable:

```bash
npm install -D storybook@10.3.5 @storybook/react-vite@10.3.5 @storybook/addon-docs@10.3.5 @storybook/react-dom-shim@10.3.5
```

### Final validation

- Root `node_modules/@storybook` contains required packages
- `npm run dev` succeeds
- Storybook loads correctly in browser

---

## Cleanup Validation

```bash
grep -Rni "getAbsolutePath\|createRequire\|node:module\|from 'path'\|from \"path\"" apps/storybook/src
grep -Rni '"types": \["node"\]' apps/storybook
```

Expected: no matches
