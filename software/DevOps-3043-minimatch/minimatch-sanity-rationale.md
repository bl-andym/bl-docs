## Rationale Summary

### Minimatch / Security Fix

- Addressed the `minimatch` ReDoS vulnerability by allowing the dependency tree to re-resolve cleanly. This was achieved by removing the existing install state and letting npm rebuild the entire dependency graph from scratch using standard semver rules, rather than forcing specific versions.
- Avoided forcing a root `overrides` fix, reducing the risk of breaking packages that rely on different `minimatch` major versions.
- Updated and aligned Storybook packages (`storybook`, `@storybook/react-vite`) to `10.3.5`, which removed the vulnerable transitive `minimatch@9.0.6` path.
- Verified the vulnerable `minimatch@9.0.6` path was removed and replaced by patched versions such as `minimatch@9.0.9`.

---

### Sanity v5 Alignment

- Aligned first-party Sanity packages to `sanity@5.22.0`.
- This removed the active mix of `sanity@5.18.0` and `sanity@5.22.0`, which had caused duplicate Sanity type graphs.
- The legacy Q42 dependency still brings in `sanity@3.99.0`, but it is now contained inside its own dependency subtree:

```
@bl-web/sanity-shared
└─ @q42/sanity-plugin-computed-page-tree@2.2.2
   └─ sanity@3.99.0
```

- In practical terms, we did not remove Sanity v3 — we isolated it.
- Our active first-party packages now resolve to the same Sanity v5 version:

```
@bl-web/studio                          → sanity@5.22.0
@bl-web/web                             → sanity@5.22.0
@bl-web/sanity-plugin-workflow          → sanity@5.22.0
@bl-web/sanity-plugin-computed-page-tree → sanity@5.22.0
```

- This allowed npm to dedupe the active v5 graph while leaving the legacy v3 Q42 tree in its own “drawer,” so it no longer leaks into the main type/runtime graph.

---

### TypeScript Changes

- Not required for the `minimatch` fix itself.
- Required as follow-on fixes after dependency alignment and Sanity version unification exposed stricter and cleaner type resolution.

Changes included:

- Removed unsafe assertions (`as unknown as X`)
  - **Example:**
    ```ts
    // Before
    card.hub.color as unknown as Hub['color']
    
    // After
    card.hub.color
    ```
  - Rationale: removed a double assertion that bypassed type safety and masked potential mismatches in generated Sanity types.

---

- Removed redundant casts flagged by ESLint
  - **Example:**
    ```ts
    // Before
    mapIllustration(highlightBannerIllustration.illustration as string)
    
    // After
    mapIllustration(highlightBannerIllustration.illustration)
    ```
  - Rationale: TypeScript already inferred the correct type, so the cast was unnecessary (`@typescript-eslint/no-unnecessary-type-assertion`).

  - **Example:**
    ```ts
    // Before
    stripPresentationModeEncodedDataFromString(tagBanner.bannerType) as 'hub' | 'functional' | undefined
    
    // After
    stripPresentationModeEncodedDataFromString(tagBanner.bannerType)
    ```
  - Rationale: relied on inferred return type instead of forcing a narrower type.

---

- Fixed invalid React `FC` usage in async Server Components
  - **Example:**
    ```ts
    // Before
    import type { FC } from 'react';

    const Page: FC<PageProps<'/'>> = async () => { ... }

    // After
    const Page = async () => { ... }
    ```
  - Rationale: `FC` is not valid for async Server Components in Next.js App Router; removing it aligns with React 18/19 patterns and avoids type conflicts.

---

- Added Node typings for Storybook config
  - **Example:**
    ```json
    // tsconfig.node.json
    {
      "compilerOptions": {
        "types": ["node"]
      }
    }
    ```
  - Rationale:
    - Explicitly includes Node.js type definitions so TypeScript understands that this config runs in a **Node runtime**, not a browser environment.
    - Without this, TypeScript defaults to DOM/browser types and does not recognise Node-specific modules.
    - Enables correct typing for Node built-ins used in Storybook config:
      ```ts
      import { createRequire } from 'node:module';
      import { join, dirname } from 'path';
      ```
  - Fixes errors like:
    ```text
    Cannot find module 'node:module' or its corresponding type declarations
    ```
  - Root cause:
    - `@types/node` was installed but not included in this tsconfig scope, so Node APIs were effectively invisible to TypeScript.

---

- Simplified Storybook docgen for improved stability and performance
  - **Example:**
    ```ts
    // Before
    reactDocgen: 'react-docgen-typescript'

    // After
    reactDocgen: 'react-docgen'
    ```
  - Rationale:
    - avoids heavy TypeScript parsing in Storybook
    - improves build performance
    - reduces edge-case failures with complex types


---

### Scope Note

The TypeScript and Sanity changes were not part of the original `minimatch` vulnerability itself. They were required follow-on changes after the dependency clean-up exposed existing version skew and stricter type/lint checks.

---

### Validation

- `npm run check-types` passed
- `npm run lint` passed
- `npm run test` passed
- `npm audit` no longer reports the original `minimatch` advisory


---

### Storybook Resolution

- Identified mismatch between Storybook execution context (root) and dependency location (workspace)
- Resolved by making Storybook dependencies root-resolvable
- Removed need for `getAbsolutePath` workaround
- Verified via successful `npm run dev` and Storybook UI load
