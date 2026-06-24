# Dependabot PR Review – Commands & Validation Checks

A structured reference for reviewing dependency-security and Dependabot remediation PRs in a TurboRepo / Next.js / Sanity monorepo.

---

# npm – Dependency Inspection

## Generic package inspection

### Inspect resolved dependency graph

```bash
npm ls <package>
```

Display the resolved dependency tree for a specific package.

---

### Inspect resolved undici versions

```bash
npm ls undici
```

Inspect resolved `undici` versions and deduping across the monorepo.

---

### Inspect resolved xstate versions

```bash
npm ls xstate
```

Inspect resolved `xstate` dependency graph and detect duplicate versions.

---

### Inspect resolved minimatch versions

```bash
npm ls minimatch
```

Inspect resolved `minimatch` versions and identify vulnerable/transitive paths.

---

### Inspect resolved semver versions

```bash
npm ls semver
```

Inspect resolved `semver` versions across all workspaces.

---

### Inspect resolved picomatch versions

```bash
npm ls picomatch
```

Inspect resolved `picomatch` dependency tree and nested resolutions.

---

### Inspect resolved lodash versions

```bash
npm ls lodash
```

Inspect resolved `lodash` versions and transitive dependency usage.

---

### Inspect resolved lodash-es versions

```bash
npm ls lodash-es
```

Inspect resolved `lodash-es` versions across the dependency graph.

---

### Inspect resolved Sanity versions

```bash
npm ls sanity
```

Inspect resolved `sanity` package versions and workspace drift.

---

### Inspect resolved @sanity/types versions

```bash
npm ls @sanity/types
```

Inspect resolved `@sanity/types` versions to detect structural incompatibilities.

---

### Inspect resolved next-sanity versions

```bash
npm ls next-sanity
```

Inspect resolved `next-sanity` versions and integration alignment.

---

### Explain why minimatch exists

```bash
npm why minimatch
```

Explain why `minimatch` exists in the dependency graph and which packages require it.

---

# npm – Storybook Inspection

### Inspect resolved Storybook versions

```bash
npm ls storybook
```

Inspect resolved Storybook versions and detect vulnerable/transitive Storybook paths.

---

### Inspect full Storybook dependency graph

```bash
npm ls storybook --all
```

Inspect the full Storybook dependency graph including all nested and deduped Storybook instances.

---

### Explain why Chromatic exists

```bash
npm why @chromatic-com/storybook
```

Explain why `@chromatic-com/storybook` exists in the dependency graph and which workspace requires it.

---

# npm – Security

### Full dependency audit

```bash
npm audit
```

Scan full dependency tree for known security vulnerabilities.

---

### Production-only dependency audit

```bash
npm audit --omit=dev
```

Scan production dependency tree only, excluding development dependencies.

---

### Filter audit JSON for package

```bash
npm audit --json | grep -i "<package>"
```

Filter npm audit JSON output for a specific package reference.

---

### Filter lodash advisories

```bash
npm audit --json | grep -i "lodash"
```

Filter npm audit JSON output for lodash-related vulnerabilities.

---

### Filter Storybook WebSocket advisories

```bash
npm audit --omit=dev | findstr /i "storybook websocket hijacking chromatic"
```

Filter production npm audit output for Storybook WebSocket Hijacking and Chromatic-related advisories.

---

### Apply safe audit fixes

```bash
npm audit fix
```

Apply non-breaking security remediations where available.

---

### Apply forced audit fixes

```bash
npm audit fix --force
```

Apply security remediations including potentially breaking dependency upgrades.

---

# npm – Installs & Updates

### Standard install

```bash
npm install
```

Install dependencies using `package.json` and existing lockfile resolution.

---

### Deterministic install

```bash
npm ci
```

Perform clean deterministic install using `package-lock.json` exactly as committed.

---

### View published package versions

```bash
npm view <package> versions --json
```

List all published versions for a package from the npm registry.

---

### Update minimatch

```bash
npm update minimatch
```

Update `minimatch` within allowed semver ranges and refresh lockfile resolution.

---

### Update API Extractor

```bash
npm update @microsoft/api-extractor
```

Update `@microsoft/api-extractor` within declared semver constraints.

---

### Update Sanity pkg-utils

```bash
npm update @sanity/pkg-utils
```

Update `@sanity/pkg-utils` and refresh dependent lockfile entries.

---

### Update Sanity plugin-kit

```bash
npm update @sanity/plugin-kit
```

Update `@sanity/plugin-kit` within configured dependency ranges.

---

### Update parent dependency

```bash
npm update <parent-package-that-depends-on-minimatch>
```

Update parent dependency to naturally resolve patched minimatch versions.

---

### Refresh picomatch lockfile only

```bash
npm update picomatch --package-lock-only
```

Refresh `picomatch` lockfile resolution without modifying installed `node_modules`.

---

### Refresh lodash lockfile only

```bash
npm update lodash --package-lock-only
```

Refresh `lodash` lockfile resolution only.

---

### Refresh lodash-es lockfile only

```bash
npm update lodash-es --package-lock-only
```

Refresh `lodash-es` lockfile resolution only.

---

### Pin picomatch version in lockfile

```bash
npm install picomatch@2.3.2 --package-lock-only
```

Pin `picomatch` lockfile resolution to version `2.3.2` without full install.

---

# npm – Workspace Scripts

### Type checking

```bash
npm run check-types
```

Execute repository TypeScript type-checking workflows.

---

### Linting

```bash
npm run lint
```

Execute repository linting rules and static analysis checks.

---

### Tests

```bash
npm run test
```

Execute automated unit and integration test suites.

---

### Full monorepo build

```bash
npm run build
```

Execute full monorepo production build pipeline.

---

### Storybook build

```bash
npm run build -w @bl-web/storybook
```

Execute Storybook production build for the `apps/storybook` workspace.

---

### Frontend build

```bash
npm run build -w @bl-web/web
```

Execute frontend Next.js production build for the `apps/web` workspace.

---

### Studio build

```bash
npm run build -w @bl-web/studio
```

Execute Sanity Studio production build for the `apps/studio` workspace.

---

### Next.js type generation

```bash
npm run next-typegen
```

Generate Next.js route and type generation artifacts.

---

### Architectural boundaries

```bash
npm run boundaries
```

Validate architectural dependency boundary constraints.

---

# Node – Lockfile Inspection

### Inspect Storybook lockfile entries

```bash
node -e "const lock=require('./package-lock.json'); for (const [k,v] of Object.entries(lock.packages||{})) if (k.includes('node_modules/storybook')) console.log(k, v.version)"
```

Inspect `package-lock.json` for all resolved Storybook versions and lockfile paths.

---

# sed – Stream Editor

`sed` is a stream editor used to read text and print, transform, insert, replace, or delete content without opening a file in an editor.

For Dependabot reviews, it is commonly used to inspect specific line ranges within large files such as `package-lock.json`.
## Common Syntax

```bash
sed [options] '<command>' <file>
```

Example:

```bash
sed -n '29726,29735p' package-lock.json
```

Read lines 29726–29735 from `package-lock.json`. ('p' is print)
## Common Flags

### Suppress automatic output

```bash
sed -n
```

Normally `sed` prints every line it reads.

`-n` suppresses automatic printing so only explicitly requested lines are shown.

Without `-n`:

```bash
sed '29726,29735p' package-lock.json
```

Output:
- Entire file
- Plus lines 29726–29735 a second time

Usually not desirable.
### Print

```bash
p
```

Print the selected lines.

Example:

```bash
sed -n '29726,29735p' package-lock.json
```

Meaning:

```text
29726,29735  -> line range
p            -> print
-n           -> suppress everything else
```

Result:
Only lines 29726–29735 are displayed.
## Dependabot Review Usage

### Inspect a lockfile block

```bash
sed -n '29726,29735p' package-lock.json
```

Inspect a specific dependency block.

Useful after locating a package with:

```bash
grep -n "shell-quote" package-lock.json
```

Example output:

```text
29726:    "node_modules/shell-quote": {
```

Then inspect the surrounding lines:

```bash
sed -n '29726,29735p' package-lock.json
```
### Inspect a parent dependency block

```bash
sed -n '35470,35490p' package-lock.json
```

Inspect the dependency that references the vulnerable package.

Example:

```json
"dependencies": {
  "shell-quote": "^1.8.4"
}
```

This helps identify which package introduced the dependency.
## Useful Mental Model

Think of:

```bash
grep
```

as:

```text
Find the line number
```

and:

```bash
sed
```

as:

```text
Show me the surrounding content
```

A common review workflow is:

```bash
grep -n "shell-quote" package-lock.json
sed -n '29726,29735p' package-lock.json
```

Find the dependency, then inspect the relevant section of the file.

---
# grep / findstr – Dependency Checks

### Search for undici declarations

```bash
grep -R "\"undici\"" -n --include=package.json .
```

Recursively search `package.json` files for direct `undici` dependency declarations.

---

### Search for semver declarations

```bash
grep "\"semver\"" package.json packages/*/package.json apps/*/package.json
```

Search root and workspace `package.json` files for `semver` declarations.

---

### Search for picomatch declarations

```bash
grep "\"picomatch\"" package.json packages/*/package.json apps/*/package.json
```

Search root and workspace `package.json` files for `picomatch` declarations.

---

### Search for lodash declarations

```bash
grep "\"lodash\"" package.json packages/*/package.json apps/*/package.json
```

Search root and workspace `package.json` files for `lodash` declarations.

---

### Search for vitest references

```bash
findstr /s /n /i "vitest" packages\sanity-plugin-workflow\*
```

Recursively search Windows filesystem for `vitest` references within `sanity-plugin-workflow`.

---

# Filesystem – Cleanup Operations

### Remove root node_modules

```bash
rm -rf node_modules
```

Remove root-level `node_modules` only.

---

### Remove node_modules and lockfile

```bash
rm -rf node_modules package-lock.json
```

Remove root `node_modules` and regenerate dependency lockfile on next install.

---

### Remove all workspace node_modules

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
```

Remove all root and workspace `node_modules` directories across the monorepo.

---

### Full monorepo dependency reset

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules package-lock.json
```

Perform full monorepo dependency reset including lockfile regeneration.

---

# Git – Status / Diff Operations

### Repository status

```bash
git status
```

Display working tree state and modified/untracked files.

---

### Diff summary

```bash
git diff --stat
```

Display summarised diff statistics for modified files.

---

### Inspect package-lock diff

```bash
git diff package-lock.json
```

Inspect detailed changes within `package-lock.json`.

---

### Inspect package and lockfile diff

```bash
git diff package.json package-lock.json
```

Inspect dependency and lockfile changes together.

---

# Git – Restore / Reset / Clean

### Restore package-lock

```bash
git restore package-lock.json
```

Restore `package-lock.json` from the current committed branch state.

---

### Reset working tree to HEAD

```bash
git reset --hard HEAD
```

Discard all local tracked file modifications and reset working tree to current `HEAD`.

---

### Reset branch to remote PR state

```bash
git reset --hard origin/dependabot/DevOps-3031-Storybook-revert-undo
```

Reset local branch state to match the remote Dependabot PR branch exactly.

---

### Remove untracked files

```bash
git clean -fd
```

Remove untracked files and directories from the working tree.

---

### Refresh remote references

```bash
git fetch origin
```

Refresh remote tracking references from origin.

---

### Restore dependency files

```bash
git checkout -- package-lock.json apps/storybook/package.json
```

Restore dependency-related files for Storybook and root lockfile.

---

### Latest commit summary

```bash
git log -1 --stat
```

Display latest commit with affected file statistics.

---

### Trigger CI manually

```bash
git commit --allow-empty -m "chore: trigger CI"
```

Create empty commit to manually retrigger CI pipelines.

---

### Push local commits

```bash
git push
```

Push local commits and refs to the configured remote repository.

---

## npm why docs

### Linux Command Library — npm-why

https://linuxcommandlibrary.com/man/npm-why

Reference-style overview of the `npm why` command, including:
- syntax
- usage examples
- command behaviour
- dependency graph explanation concepts

Useful as a quick lookup/reference guide.

---

### npmjs — npm-why package

https://www.npmjs.com/package/npm-why

NPM package page for the legacy/community `npm-why` utility.

Includes:
- installation instructions
- CLI examples
- dependency explanation output examples
- package metadata and version history

Useful for understanding the historical/community tooling around dependency provenance inspection.

