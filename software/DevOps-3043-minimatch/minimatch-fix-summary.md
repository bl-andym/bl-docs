## Summary

- Investigated Dependabot alert for **minimatch ReDoS (matchOne / GLOBSTAR)**
- Identified vulnerable path via `@storybook/react-vite → glob → minimatch@9.0.6`
- Upgraded Storybook dependencies to **10.3.5**, resolving to **minimatch@9.0.9 (patched)**

---

## 1. Vulnerability (root cause)

### GitHub Advisory
- GitHub Advisory Database  
- Advisory: [minimatch ReDoS (matchOne / GLOBSTAR)](https://github.com/advisories/GHSA-7r86-cg39-jmmj)  
- ID: `GHSA-7r86-cg39-jmmj`

Confirms:
- Affected range: `>=9.0.0 <9.0.7`
- Fix: upgrade to `9.0.7+`

---

## 2. Transitive dependency resolution (why upgrade Storybook)

### npm docs (official)
- npm — Dependency resolution & tree  
- https://docs.npmjs.com/cli/v10/commands/npm-ls

Confirms:
- Vulnerabilities can exist in **transitive dependencies**
- Fix strategy = **upgrade the parent dependency**, not necessarily install the package directly

### Node ecosystem best practice (de facto)
- OWASP / general guidance:
  > “Upgrade the top-level dependency introducing the vulnerable package”

Justifies:
- Upgrading `@storybook/react-vite` instead of forcing `minimatch`

---

## 3. Storybook version alignment (peer dependency correctness)

### Storybook docs
- https://storybook.js.org/docs

Key principle:
- Storybook packages must be kept on the **same version**
- Mismatched versions → **peer dependency conflicts / runtime issues**

### npm peer dependency rules (official)
- https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies

Justifies:
```json
"storybook": "10.3.5",
"@storybook/react-vite": "10.3.5"
```

---

## 4. Clean reinstall (removing stale state)

### npm install behavior
- https://docs.npmjs.com/cli/v10/commands/npm-install

### De facto practice
> Delete `node_modules` + lockfile when resolving dependency conflicts

Justifies:
- Removing stale `9.1.5` install
- Eliminating `extraneous` / `invalid` packages
- Ensuring deterministic resolution

---

## 5. Dependency tree inspection

### npm ls
- https://docs.npmjs.com/cli/v10/commands/npm-ls

Justifies:
```
@storybook/react-vite → glob → minimatch
```

- Verifying patched version (`9.0.9`)

---

## 6. Avoiding overrides as first approach

### npm overrides (official)
- https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides

Guidance:
- Use overrides cautiously
- Prefer upgrading parent dependency

Justifies:
- Decision **not** to globally override `minimatch`

---

## 7. Supply chain / dependency security guidance

### OWASP
- OWASP Dependency Management / Vulnerable Components

Principle:
- Keep dependencies updated
- Prefer upstream fixes over local patches

---

## Final mapping (justification)

| Action                                     | Documentation backing      |
| ------------------------------------------ | -------------------------- |
| Identify vulnerable minimatch              | GitHub Advisory            |
| Trace via npm ls                           | npm docs                   |
| Upgrade Storybook (not minimatch directly) | npm + OWASP                |
| Align Storybook versions                   | Storybook docs + peer deps |
| Clean reinstall                            | npm + de facto practice    |
| Avoid overrides                            | npm overrides guidance     |

---

---

## 8. Validation

- `npm audit` no longer reports the minimatch advisory
- `npm ls minimatch` shows only patched versions (e.g. `9.0.9`)
- No `overrides` were introduced in `package.json`
- `npm run check-types`, `lint`, and `test` all pass

---

## Security Fix Summary

Resolved transitive `minimatch` ReDoS vulnerability by upgrading dependent Storybook packages in line with GitHub Advisory guidance and npm dependency resolution best practices, avoiding unsafe overrides and ensuring a clean, deterministic install state.

Aligned all Storybook packages (`storybook`, `@storybook/react-vite`) to the same version to avoid peer conflicts.

Performed full clean reinstall to remove stale `node_modules` and ensure consistent dependency resolution.


---

## 8. Validation

- `npm audit` no longer reports the minimatch advisory
- `npm ls minimatch` shows only patched versions (e.g. `9.0.9`)
- No `overrides` were introduced in `package.json`
- `npm run check-types`, `npm run lint`, and `npm run test` all pass
