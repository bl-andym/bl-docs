# Dependabot remediation

Workflow and command reference for reviewing dependency-security and Dependabot remediation PRs in a TurboRepo / Next.js / Sanity monorepo.

See also: [CLI commands and diagnostics index](./README.md) · [Sanity CLI commands](./sanity-cli-commands.md)

---

## Workflow

### 1. Get alert details from GitHub → Security and quality

Review:

- advisory severity
- patched version
- CVE scope
- affected dependency chain

→ [Security audit commands](#security-audit)

---

### 2. Run targeted checks for the affected package

Use focused graph and audit checks instead of broad upgrades.

```bash
npm ls <package>
npm audit --json | grep -i <package>
```

→ [Dependency inspection](#dependency-inspection) · [Security audit](#security-audit)

---

### 3. Identify whether the dependency is direct or transitive

Determine whether the package is:

- directly owned in `package.json`
- inherited transitively through another dependency

```bash
npm ls <package>
```

Example output:

```text
my-app
├── minimatch@10.2.4        ← direct
└─┬ some-lib
  └── minimatch@10.0.3      ← transitive
```

→ [Dependency inspection](#dependency-inspection) · [Ownership checks](#ownership-checks)

---

### 4. Confirm the currently resolved installed version

Validate the actual installed version in `node_modules` and `package-lock.json`.

```bash
npm ls <package>
grep -n "<package>-<version>" package-lock.json
```

→ [Dependency inspection](#dependency-inspection) · [Lockfile inspection](#lockfile-inspection)

---

### 5. Trace the dependency path

Identify which parent package introduces the vulnerable dependency.

```bash
npm ls <package>
npm why <package>
```

→ [Dependency inspection](#dependency-inspection)

---

### 6. Check `package.json` ownership before adding dependencies

Avoid incorrectly promoting transitive packages into direct dependencies.

A transitive dependency is already introduced by another package in the dependency graph.

Example:

```text
@sanity/plugin-kit
└── lodash
```

In this case:

- `@sanity/plugin-kit` is the direct dependency
- `lodash` is only transitively resolved

Incorrect promotion occurs when a transitive dependency is manually added to the application's own `package.json` without the application actually owning or importing it directly.

```json
"dependencies": {
  "lodash": "4.18.1"
}
```

This can introduce unnecessary ownership and create dependency graph instability, including:

- duplicate package resolution
- invalid dependency trees
- peer dependency conflicts
- unexpected deduping behaviour
- unnecessary lockfile churn

It can also obscure the real remediation path, where the correct fix may instead be:

- upgrading the parent dependency
- aligning ecosystem package versions
- using scoped `overrides`
- or waiting for upstream remediation

→ [Ownership checks](#ownership-checks)

---

### 7. Use `package-lock.json` to confirm resolution, not ownership

**Resolution** means the exact package version npm has selected and locked after dependency calculation.

The lockfile is useful for confirming:

- the resolved version
- the resolved tarball URL
- whether an override has taken effect
- whether stale vulnerable versions remain
- whether multiple versions are still present

**Ownership** means the package is intentionally declared by the project or workspace in `package.json`.

The lockfile does **not** prove ownership, because it contains both direct and transitive dependencies. For ownership, check `package.json` files instead.

```text
package.json      = ownership / intent
package-lock.json = resolution / exact installed graph
```

→ [Ownership checks](#ownership-checks) · [Lockfile inspection](#lockfile-inspection)

---

### 8. Remediate: prefer parent upgrade, then `overrides`

Prefer ecosystem upgrades over forced resolutions where possible.

Upgrading the parent dependency keeps the dependency graph aligned with upstream support and reduces the risk of:

- invalid dependency trees
- peer dependency conflicts
- unexpected deduping behaviour
- brittle lockfile state
- unsupported package combinations

**Preferred — upgrade the parent dependency:**

```bash
npm update <parent-package>
```

Examples: `npm update @sanity/plugin-kit`, `npm update @microsoft/api-extractor`

This allows npm to resolve newer compatible transitive versions naturally through upstream supported ranges.

**Fallback — use `overrides` for transitive vulnerabilities where parent upgrades are not practical:**

```json
"overrides": {
  "<package>": "<patched-version>"
}
```

```text
Parent upgrade  = ecosystem-aligned remediation
Override        = forced transitive remediation
```

Treat overrides as targeted, temporary where possible, scoped narrowly, and always validated (see [Validation checklist](#validation-checklist)).

→ [Installs and updates](#installs-and-updates)

---

### 9. Remove stale installs if `npm ls` shows `invalid` or unexpected old versions

Reset stale dependency trees when installed state diverges from the lockfile.

→ [Filesystem cleanup](#filesystem-cleanup)

---

### 10. Validate and review the PR

Run the [validation checklist](#validation-checklist), then inspect git diffs before merging.

→ [Git operations](#git-operations)

---

## Validation checklist

Run after any remediation change (parent upgrade, override, or lockfile refresh):

```bash
npm ls <package>
npm audit --json | grep -i <package>
npm run check-types
npm run lint
npm run test
npm run build
```

For workspace-specific impact, also build affected apps — see [Workspace scripts](#workspace-scripts).

---

## Command reference

### Dependency inspection

Display the resolved dependency tree for a package:

```bash
npm ls <package>
```

Explain why a package exists in the graph and which packages require it:

```bash
npm why <package>
```

Inspect the full graph including nested and deduped instances:

```bash
npm ls <package> --all
```

#### Packages commonly triaged

| Package | Typical concern |
|---------|-----------------|
| `minimatch` | ReDoS / transitive paths |
| `lodash`, `lodash-es` | Prototype pollution advisories |
| `picomatch`, `semver` | Transitive resolution drift |
| `undici` | HTTP client vulnerabilities |
| `xstate` | Duplicate version detection |
| `sanity`, `@sanity/types`, `next-sanity` | Ecosystem alignment |
| `storybook`, `@chromatic-com/storybook` | Dev tooling / WebSocket advisories |

External references for `npm why`:

- [Linux Command Library — npm-why](https://linuxcommandlibrary.com/man/npm-why)
- [npmjs — npm-why package](https://www.npmjs.com/package/npm-why) (legacy community utility)

---

### Security audit

```bash
# Full dependency tree
npm audit

# Production dependencies only (exclude devDependencies)
npm audit --omit=dev

# Filter output for a specific package
npm audit --json | grep -i "<package>"

# Apply non-breaking fixes
npm audit fix

# Apply fixes including potentially breaking upgrades
npm audit fix --force
```

On Windows, filter production audit output with `findstr` instead of `grep`:

```cmd
npm audit --omit=dev | findstr /i "storybook websocket"
```

---

### Ownership checks

Search root and workspace `package.json` files for direct declarations:

```bash
grep "\"<package>\"" package.json packages/*/package.json apps/*/package.json
```

Recursively search all `package.json` files under the repo:

```bash
grep -R "\"<package>\"" -n --include=package.json .
```

On Windows, search a specific path:

```cmd
findstr /s /n /i "<package>" packages\<workspace>\*
```

---

### Lockfile inspection

Confirm a resolved version appears in the lockfile:

```bash
grep -n "\"version\": \"<version>\"" package-lock.json
```

Confirm whether a vulnerable tarball is still locked:

```bash
grep -n "<package>-<vulnerable-version>" package-lock.json
```

Inspect all resolved instances of a scoped path (Storybook example):

```bash
node -e "const lock=require('./package-lock.json'); for (const [k,v] of Object.entries(lock.packages||{})) if (k.includes('node_modules/storybook')) console.log(k, v.version)"
```

Refresh lockfile resolution without modifying `node_modules`:

```bash
npm update <package> --package-lock-only
```

Pin a specific version in the lockfile only:

```bash
npm install <package>@<version> --package-lock-only
```

---

### Installs and updates

```bash
# Install from package.json and existing lockfile
npm install

# Clean deterministic install from committed lockfile
npm ci

# List published versions from the registry
npm view <package> versions --json

# Update within declared semver ranges
npm update <package>
```

---

### Workspace scripts

```bash
npm run check-types          # TypeScript type checking
npm run lint                 # Linting and static analysis
npm run test                 # Unit and integration tests
npm run build                # Full monorepo production build
npm run next-typegen         # Next.js route/type generation
npm run boundaries           # Architectural dependency boundaries
```

Build individual workspaces:

```bash
npm run build -w @bl-web/storybook   # apps/storybook
npm run build -w @bl-web/web         # apps/web (Next.js)
npm run build -w @bl-web/studio      # apps/studio (Sanity Studio)
```

---

### Filesystem cleanup

```bash
# Remove root node_modules only
rm -rf node_modules

# Remove node_modules and lockfile (regenerate on next install)
rm -rf node_modules package-lock.json

# Remove all workspace node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Full monorepo dependency reset
rm -rf node_modules apps/*/node_modules packages/*/node_modules package-lock.json
npm install
```

---

### Git operations

#### Status and diff

```bash
git status
git diff --stat
git diff package-lock.json
git diff package.json package-lock.json
git log -1 --stat
```

#### Restore and reset

```bash
# Restore lockfile from current branch
git restore package-lock.json

# Restore specific dependency files
git checkout -- package-lock.json apps/<workspace>/package.json

# Discard all local tracked modifications
git reset --hard HEAD

# Match local branch to remote PR branch
git fetch origin
git reset --hard origin/<branch-name>

# Remove untracked files and directories
git clean -fd
```

#### Push and CI

```bash
git push
git commit --allow-empty -m "chore: trigger CI"
```
