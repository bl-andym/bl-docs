## Analysis Summary
 
I've reviewed the full project setup. Here's what I found and why the CSS breaks:
 
### Root Cause: CSS Chunking Change in Next.js 15.5.10
 
Your `layout.tsx` does this:
 
```ts
import "@bl-web/css-variables"; // → resolves to src/index.ts → imports 9 SCSS files
import "@/styles/global.scss";
```
 
The `@bl-web/css-variables` package's `index.ts` side-effect-imports 9 SCSS files that define **all** CSS custom properties (`--background-secondary`, `--font-sans`, `--color-text-primary`, etc.). Every component SCSS module and `global.scss` depends on these variables being defined first.
 
Next.js 15.5.10 introduced a change to how CSS is split into webpack chunks. With the new default "strict" CSS chunking strategy, the CSS from `@bl-web/css-variables` (flowing through a TypeScript entry point → multiple SCSS files) can end up in a **different chunk** than the rest of your styles. When these chunks load out of order, the CSS custom properties aren't defined yet when component styles try to use them — so everything breaks visually.
 
### Additional Issue: Existing Version Mismatch
 
Before we even get to 15.5.10, these packages are behind in `apps/web/package.json`:
 
- `next: 15.5.9`
- `eslint-config-next: 15.5.2` ← already 3 patch versions behind!
- `@next/bundle-analyzer: 15.5.2` ← same
- `@next/third-parties: ^15.5.2` ← caret, so auto-satisfies but should be explicit
 
These should always be kept in sync — mismatched `eslint-config-next` can cause false lint passes.
 
---
 
## Proposed Upgrade Plan
 
### Step 1 — Create a dedicated branch
 
Follow your convention:
 
```
chore/nextjs-15.5.10-upgrade
```
 
(or with a Jira ticket: `chore/WFP1-xxx-nextjs-15.5.10-upgrade`)
 
### Step 2 — Sync all Next.js package versions in `apps/web/package.json`
 
| Package                 | From      | To         |
| ----------------------- | --------- | ---------- |
| `next`                  | `15.5.9`  | `15.5.10`  |
| `eslint-config-next`    | `15.5.2`  | `15.5.10`  |
| `@next/bundle-analyzer` | `15.5.2`  | `15.5.10`  |
| `@next/third-parties`   | `^15.5.2` | `^15.5.10` |
 
Keeping all these in sync is good hygiene and avoids subtle build/lint inconsistencies.
 
### Step 3 — Add `cssChunking: 'loose'` to `next.config.ts`
 
This is the **key CSS fix**. Add an `experimental` block:
 
```ts
const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "build",
  typedRoutes: true,
  // ... rest of existing config ...
 
  experimental: {
    cssChunking: "loose", // ← ADD THIS
  },
};
```
 
**Why `'loose'` works**: The `'strict'` default aggressively splits CSS into per-route chunks. `'loose'` tells webpack to relax that splitting and preserve CSS import order — which is critical because your CSS custom properties from `@bl-web/css-variables` must be in the same chunk (or earlier chunk) than any CSS module that references them. The performance tradeoff is negligible for your use case, and preserving correct CSS load order is essential.
 
### Step 4 — Install & build
 
```bash
npm install               # regenerate lock file with new versions
npm run build -w apps/web # production webpack build
```
 
Check the build output — you should see no CSS ordering warnings.
 
### Step 5 — Visual check with dev server
 
```bash
npm run dev -w apps/web
```
 
Navigate around the site and confirm:
 
- Background colours (from `--background-secondary`)
- Typography (from `--font-sans`)
- Spacing & layout CSS variables all resolve
- Component SCSS modules render correctly
 
### Step 6 — Bundle analysis (optional but recommended)
 
```bash
BUNDLE_ANALYZE=true npm run build -w apps/web
```
 
Open the generated report and inspect the CSS chunks. They should be well-consolidated rather than fragmented across many small files.
 
### Step 7 — Full pre-PR check
 
```bash
npm run check
```
 
This runs types, tests, lint, and format checks as per your pre-commit checklist.
 
### Step 8 — Deploy to DEV, then NLE
 
Per your deployment process: auto-deploy to DEV on PR, then manual approval to NLE for visual regression testing before production.
 
---
 
## Risk Assessment
 
| Change                            | Risk     | Notes                                                                    |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| `next` version bump               | Low      | Patch release, security fix                                              |
| `cssChunking: 'loose'`            | Very Low | Reverts chunk splitting to pre-15.5.10 behaviour; well-documented option |
| Syncing `eslint-config-next` etc. | Very Low | Removes existing version skew; purely tooling                            |
 
The `cssChunking: 'loose'` setting is worth adding as a permanent config entry — even if a future Next.js patch reverts the regression, having it explicit protects you from future regressions of the same kind.