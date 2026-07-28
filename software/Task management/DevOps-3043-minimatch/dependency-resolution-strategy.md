# Dependency Resolution Strategies

Three possible strategies were identified:

## 1. Proper fix (best practice)

-   Clean install
-   Allow npm to resolve the dependency graph naturally
-   Fix all issues exposed

Result: stable system

## 2. Containment fix (partial)

-   Force a patched version somewhere in the dependency tree

Result: locally safe, globally inconsistent

## 3. Hack/workaround approach

-   Bypass dependency resolution rules

Result: appears fixed, but underlying issues remain

------------------------------------------------------------------------

## Hack options that could have been used

### Option A --- overrides in package.json

``` json
{
  "overrides": {
    "minimatch": "^9.0.5"
  }
}
```

**What it does**
Forces all consumers to use patched minimatch

**Why it works**
npm rewrites the dependency tree during install

**Why it's risky** - Overrides transitive dependency contracts -
Upstream packages may: - expect older APIs - behave differently

Classic "it installs, but may break at runtime"

------------------------------------------------------------------------

### Option B --- npm install --force or --legacy-peer-deps

``` bash
npm install --legacy-peer-deps
```

**What it does**
Ignores peer dependency conflicts

**Why it's dangerous**
Suppresses errors such as: - vite/plugin mismatch - esbuild
incompatibility

This would have completely hidden: - the Vite misalignment - the Vitest
failure - the React runtime issue

------------------------------------------------------------------------

### Option C --- Direct sub-dependency install

``` bash
npm install minimatch@latest
```

**What it does**
Adds minimatch at the root

**Why it doesn't really work** - Transitive dependencies do not
necessarily use it - Node resolution may still select nested versions

False sense of security

------------------------------------------------------------------------

### Option D --- patch-package (hard override)

-   Manually patch `node_modules/minimatch`
-   Commit the patch

**Why this is used** - Emergency security fixes

**Why it's brittle** - Breaks on every install - Not scalable -
Difficult to audit

------------------------------------------------------------------------

## What would have happened with a hacked approach

If a workaround had been used:

### It would have "fixed":

-   minimatch vulnerability alert

### But silently retained:

-   Vite/plugin incompatibility
-   esbuild misalignment
-   multiple conflicting dependency trees
-   Vitest runtime failure (hidden until later)
-   React runtime misconfiguration

### Result

The system would be:

> "secure on paper, unstable in reality"

------------------------------------------------------------------------

## Why the chosen approach was superior

The actual approach taken:

``` bash
rm -rf node_modules package-lock.json
npm install
```

This forced: - full dependency graph recomputation - semver-based
resolution - exposure of real incompatibilities

------------------------------------------------------------------------

## Key engineering principle

A vulnerability is often a symptom, not the root problem.

The minimatch alert was the trigger, not the issue.

------------------------------------------------------------------------

## When a workaround is acceptable

There are scenarios where a workaround may be justified:

-   Production outage
-   No upstream fix available
-   Time-critical patch

In those cases:

1.  Use overrides
2.  Ship a hotfix
3.  Create a follow-up ticket to properly resolve the dependency graph

In this case, the process effectively moved straight to the proper
resolution.

------------------------------------------------------------------------

## Final answer

Yes, the dependency fault chain could have been bypassed using:

-   overrides
-   --legacy-peer-deps
-   forced installs
-   patching

However, doing so would have:

-   hidden real incompatibilities
-   delayed failures to runtime/CI
-   increased long-term risk

------------------------------------------------------------------------

## The real takeaway

This work is better described as:

> dependency graph refactoring

rather than simply a fix.
