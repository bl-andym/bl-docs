# `node_modules` Cache Condition in CI

## Overview

The CI workflows currently use the following condition:

```yml
if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
```

This condition means dependency installation only runs when the `node_modules` cache is missing.

The intent is performance optimisation: if a cached `node_modules` tree exists, CI skips `npm ci` and reuses the restored dependency tree.

That approach is risky for dependency security work because it allows CI to validate against cached installed packages instead of forcing the dependency tree to be rebuilt from `package-lock.json`.

This became visible during recent Dependabot remediation work, including:

- DevOps-3040: `picomatch` ReDoS via extglob quantifiers
- DevOps-3043: `minimatch` ReDoS / `matchOne()` / GLOBSTAR issues

---

## Current Issue

The current workflow can create a mismatch between three important dependency sources:

```text
package.json       = requested dependency intent
package-lock.json  = exact dependency resolution
node_modules       = currently installed dependency tree
```

In a deterministic CI install, these should align.

However, the current cache strategy allows this state:

```text
package-lock.json  = updated by PR
node_modules       = restored from previous cache
npm ci             = skipped
```

That results in:

```text
node_modules ≠ package-lock.json
```

This is the core issue.

---

## Current Behaviour

### Current `checks.yml` pattern

```yml
- name: Check if cache already exists
  id: restore-cached-node-modules
  uses: actions/cache/restore@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: npm-node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    lookup-only: true

- name: Cache npm
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-

- name: Install dependencies
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  run: npm ci

- name: Save node_modules
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  uses: actions/cache/save@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: npm-node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

### Current install logic

```text
node_modules cache hit
→ npm ci skipped
→ cached dependency tree reused
→ lockfile may not be re-applied
```

### Problem with this behaviour

`npm ci` is the step that guarantees installed dependencies match `package-lock.json`.

If `npm ci` is skipped, CI is no longer validating the dependency tree defined by the current PR. It is validating whatever was restored from cache.

---

## Why This Matters for Dependency Security Fixes

Security fixes often depend on exact dependency resolution.

For example, DevOps-3040 used a root override:

```json
"overrides": {
  "picomatch": "2.3.2"
}
```

This override is only reflected in the installed dependency tree when npm performs dependency installation/resolution.

If the workflow restores cached `node_modules` and skips `npm ci`, then:

```text
override exists in package.json
package-lock.json may be correct
cached node_modules may still contain vulnerable picomatch@2.3.1
```

That means CI may be checking stale dependencies.

---

## Example Failure Mode

### Intended state

```text
package.json
└─ overrides.picomatch = 2.3.2

package-lock.json
└─ picomatch@2.3.2

node_modules
└─ picomatch@2.3.2
```

### Possible current CI state

```text
package.json
└─ overrides.picomatch = 2.3.2

package-lock.json
└─ picomatch@2.3.2

node_modules
└─ picomatch@2.3.1
```

This can happen if `node_modules` is restored from cache and install is skipped.

---

## Observed Symptoms

This workflow pattern can cause:

- `npm ls <package>` reporting versions that do not match the intended lockfile state
- stale vulnerable packages remaining in `node_modules`
- Safe-chain or audit checks behaving inconsistently
- local results differing from CI results
- CI passing or failing based on cache state rather than current dependency state
- difficult-to-reproduce dependency issues

In the recent dependency work, similar symptoms were seen around package version drift and stale installs.

---

## Current State vs Proposed State

### Current state

```text
CI restores node_modules cache
→ if cache-hit == true
→ npm ci skipped
→ dependency tree may be stale
→ checks run against cached install
```

### Proposed state

```text
CI restores npm download cache only
→ npm ci always runs
→ node_modules rebuilt from package-lock.json
→ checks run against current lockfile state
```

---

## Recommended Fix

The recommended fix is:

- stop caching `node_modules`
- cache only npm's package download cache (`~/.npm`)
- always run `npm ci`

This keeps the performance benefit of cached downloads while preserving deterministic installs.

---

## Proposed `checks.yml` Install Section

### Before

```yml
- name: Check if cache already exists
  id: restore-cached-node-modules
  uses: actions/cache/restore@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: npm-node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    lookup-only: true

- name: Cache npm
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-

- name: Install dependencies
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  run: npm ci

- name: Save node_modules
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  uses: actions/cache/save@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: npm-node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

### After

```yml
- name: Cache npm
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-

- name: Install dependencies
  run: npm ci
```

---

## Proposed `enforce-gitflow.yml` Install Section

### Before

```yml
- name: Check if cache already exists
  id: restore-cached-node-modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      apps/*/node_modules
      packages/*/node_modules
    key: npm-node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Setup safe-chain
  run: |
    npm i -g @aikidosec/safe-chain
    safe-chain setup-ci

- name: Install dependencies
  if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
  run: npm ci
```

### After

```yml
- name: Cache npm
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-

- name: Setup safe-chain
  run: |
    npm i -g @aikidosec/safe-chain
    safe-chain setup-ci

- name: Install dependencies
  run: npm ci
```

---

## Why `~/.npm` Cache Is Safer Than `node_modules` Cache

`~/.npm` contains downloaded package tarballs and metadata.

`node_modules` contains the realised dependency tree.

Caching `~/.npm` improves install performance because npm can reuse downloaded packages, but `npm ci` still rebuilds `node_modules` from the lockfile.

This means:

```text
~/.npm cache = performance optimisation
node_modules cache = dependency state shortcut
```

The first is generally safe.

The second can become stale or inconsistent.

---

## Why `npm ci` Should Always Run

`npm ci` is designed for CI environments.

It:

- removes the existing `node_modules`
- installs exactly from `package-lock.json`
- fails if `package.json` and `package-lock.json` are out of sync
- avoids opportunistic dependency updates
- provides deterministic dependency installation

This makes it the correct command for security-sensitive dependency validation.

---

## Expected Improvement

After the workflow change:

### Before

```text
Cache hit
→ npm ci skipped
→ stale node_modules possible
→ dependency checks may not reflect PR lockfile
```

### After

```text
npm cache restored
→ npm ci always runs
→ node_modules rebuilt from package-lock.json
→ dependency checks reflect PR lockfile
```

This improves:

- determinism
- reproducibility
- dependency security validation
- consistency between local and CI
- reliability of `npm ls`, `npm audit`, Safe-chain, lint, test, and build checks

---

## Impact on DevOps-3040 and DevOps-3043

### DevOps-3040: Picomatch

The `picomatch` fix depends on the override being applied:

```json
"picomatch": "2.3.2"
```

Always running `npm ci` ensures CI installs the patched dependency tree and does not reuse stale `picomatch@2.3.1`.

### DevOps-3043: Minimatch

The `minimatch` remediation depends on CI validating the current dependency graph, not a cached previous install.

Always running `npm ci` ensures any Storybook/Sanity/minimatch dependency updates are reflected during checks.

---

## Risk / Trade-Off

### Trade-off

CI may spend more time installing dependencies because `node_modules` is no longer restored directly.

### Mitigation

Caching `~/.npm` keeps package downloads fast while preserving correctness.

### Preferred priority

For security fixes, correctness should take priority over install shortcutting.

---

## Final Recommendation

Remove all instances where this condition prevents `npm ci` from running:

```yml
if: steps.restore-cached-node-modules.outputs.cache-hit != 'true'
```

Stop caching:

```text
node_modules
apps/*/node_modules
packages/*/node_modules
```

Keep caching:

```text
~/.npm
```

Always run:

```yml
- name: Install dependencies
  run: npm ci
```

This ensures CI validates the dependency tree defined by the current PR and prevents stale cached installs from undermining security fixes.
