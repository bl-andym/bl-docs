Domain-based icon suppression

**File:** `apps/web/src/utils/prop-mappers/map-link.ts`
**Block:** domain-based icon suppression
**Feature:** WFP1-894 Domain-based icon suppression
**Scope:** Round 1 changes to this file, with Round 2 addendum where relevant

---
## 1. SUMMARY OF CHANGES

The module supports domain-based suppression of the external link icon for links targeting `bl.uk` or `*.bl.uk`. An import of `isBLUkDomain` from `@/utils/link-utils` was added. The `getLinkIcon` function was extended with an optional second parameter (`href`). For external links, `getLinkIcon` now returns `undefined`(`undefined` means “no icon.” in this con text) when the href is a BL domain and returns `'externalLink'` otherwise. The `mapLink` function and the `Link` type were not modified.

In this codebase, **`undefined` means “no icon.”**

`getLinkIcon` returns a **`LinkIconName`** or **`undefined`**:

```typescript
type LinkIconName = 'externalLink' | 'arrow-right' | 'download';
```

So the return value is either **which icon to show**, or **`undefined` = don’t show one**.

For external links:

| Return value | Meaning |
|--------------|---------|
| `'externalLink'` | Show ↗ |
| `undefined` | Show no icon |

For a BL URL (`https://iiif.bl.uk/...`), we want **no ↗**; same as many internal links. The function expresses that by returning **`undefined`**, not a special value like `'none'`.

Callers use it like:

```tsx
icon={getLinkIcon(linkType, href)}  // undefined → Button renders no icon
linkIcon={...}                       // undefined → ContentCard renders no icon
```

**Why not another value?**

- There is no `'internal'` or `'noIcon'` in `LinkIconName`.
- **`undefined`** is already the pattern for “this link type gets no icon” (e.g. internal links in some mappers pass `undefined` explicitly).
- Components treat **`undefined`** as falsy and skip rendering `<Icon />`.

**In one line:** `undefined` isn’t an error — it’s the typed way to say **“suppress the external-link icon for this external URL.”**

---

## 2. CHANGE 1: NEW IMPORT
 

**BEFORE:**
```ts

import type { DsLinkData, LinkIconName } from '@bl-web/design-system/types';

import type { AssetLinkFragment } from '@/api/shared/fragments/link-fragments';

import { createDownloadurl } from '@/sanity/file';

```


**AFTER:**
```ts

import type { DsLinkData, LinkIconName } from '@bl-web/design-system/types';

import type { AssetLinkFragment } from '@/api/shared/fragments/link-fragments';

import { createDownloadurl } from '@/sanity/file';

import { isBLUkDomain } from '@/utils/link-utils';

```

**RATIONALE:**
`getLinkIcon` must determine whether an external link's href targets a `bl.uk` or `*.bl.uk` host. That logic is implemented in `isBLUkDomain`. Importing it here allows `getLinkIcon` to call it when evaluating the optional `href` argument for external links.

**NEW IMPORT:**

- `isBLUkDomain` from `@/utils/link-utils`

`isBLUkDomain` is **implemented** in `@bl-web/common/utils/is-bl-uk-domain` and **re-exported** from `link-utils.ts`. `map-link.ts` still imports via `@/utils/link-utils`; the import path is unchanged. Alternatively, `map-link.ts` may import directly from `@bl-web/common/utils/is-bl-uk-domain` and drop the re-export indirection.

---
## 3. CHANGE 2: getLinkIcon SIGNATURE

**BEFORE:**
```ts
export const getLinkIcon = (linkType?: 'external' | 'internal' | 'asset'): LinkIconName | undefined => {
```

**AFTER:**
```ts

export const getLinkIcon = (linkType?: 'external' | 'internal' | 'asset', href?: string): LinkIconName | undefined => {

```

**RATIONALE:**
Callers that have the resolved link URL (e.g. mapped href) must be able to pass it so `getLinkIcon` can distinguish BL domains from non-BL external links. The second parameter is optional so callers that do not pass `href` continue to work; in that case external links still receive `'externalLink'`.

**NEW PARAMETER:**
- `href` (optional string). The resolved URL of the link. Used only when `linkType` is `'external'`.

---
## 4. CHANGE 3: EXTERNAL LINK BRANCH LOGIC

**BEFORE:**
```ts
switch (linkType) {

case 'external':

return 'externalLink';

case 'asset':

```

  

**AFTER:**
```ts
switch (linkType) {

case 'external':

return href && isBLUkDomain(href) ? undefined : 'externalLink';

case 'asset':

```

**RATIONALE:**
External links to `bl.uk` or `*.bl.uk` should not display the external link icon. When `href` is provided and `isBLUkDomain(href)` is true, the function returns `undefined` (no icon). When `href` is missing or `isBLUkDomain(href)` is false, the function returns `'externalLink'`. Internal and asset branches are unchanged.

**BEHAVIOUR:**
- If `linkType` is `'external'` and `href` is truthy and `isBLUkDomain(href)` returns true: return `undefined`.
- Otherwise if `linkType` is `'external'`: return `'externalLink'`.
- `isBLUkDomain` is not called when `href` is falsy.
  
---
## 5. IMPORTS, TYPES, AND DEPENDENCIES

**Round 1:**
- New import: `isBLUkDomain` from `@/utils/link-utils`
- No new types added to this file
- `Link`, `DsLinkData`, `LinkIconName`, `AssetLinkFragment`, and `createDownloadurl` unchanged
- No direct `package.json` changes in `map-link.ts`

**Round 2:**
- `isBLUkDomain` implementation moved to `packages/common/src/utils/is-bl-uk-domain.ts`
- `link-utils.ts` re-exports from `@bl-web/common` (optional indirection)
- `map-link.ts` has no direct dependency on `@bl-web/common` unless the import is simplified 

---
## 6. CALL SITE IMPACT

**Function behaviour (unchanged):**

- Callers that pass only `linkType` (e.g. `getLinkIcon(link?.linkType)`) retain previous behaviour: external links receive `'externalLink'`.
- Callers that pass resolved `href` (e.g. `getLinkIcon(link?.linkType, mappedLink?.href)`) enable domain suppression for BL URLs.
- Internal and asset call sites are unaffected; `href` is ignored for those link types.

**Round 2 update:**
All `getLinkIcon` call sites in `apps/web` now pass `href`, including `map-card-grid.ts` (content-card fix). Domain suppression therefore runs everywhere this function is used in the web app.

**Not covered by `getLinkIcon`:**
Design-system components that set icons themselves use `getExternalLinkIcon()` from `packages/design-system/src/utils/get-external-link-icon.ts` (same rule, parallel entry point):
- `RichText`
- `IllustrationCard`
- `BipcButton`

---
## 7. RISK AND SIDE EFFECTS

Low risk. The change is backward compatible at the function level. Callers that do not pass `href` retain previous behaviour. Callers that pass `href` must pass the resolved URL (e.g. from `mapLink` output) so the hostname check is meaningful.

`isBLUkDomain` handles invalid URLs by returning `false` (see `packages/common/src/utils/is-bl-uk-domain.ts`), so `getLinkIcon` does not throw.

No changes to `mapLink` or link data structures; only icon selection for external links is affected.

---
## 8. EDGE CASES

| Scenario | Result |
|----------|--------|
| `href` is `undefined` or empty | `href && isBLUkDomain(href)` is falsy → returns `'externalLink'` |
| Relative path or invalid URL | `isBLUkDomain` returns `false` → returns `'externalLink'` |
| Full URL with host `bl.uk` or `*.bl.uk` | `isBLUkDomain` returns `true` → returns `undefined` (no icon) |
| Example: `https://iiif.bl.uk/uv/#?manifest=...` | Treated as BL domain → no icon |

  

---

  

## 9. ROUND 2 ADDENDUM (CODEBASE CONTEXT)

Round 2 did **not** change `getLinkIcon` logic in this file. Related work elsewhere:

| File | Change |
|------|--------|
| `packages/common/src/utils/is-bl-uk-domain.ts` | Shared domain helper (new) |
| `packages/common/src/utils/is-bl-uk-domain.test.ts` | Unit tests (new) |
| `apps/web/src/utils/link-utils.ts` | Re-exports `isBLUkDomain` from common |
| `apps/web/src/utils/prop-mappers/map-card-grid.ts` | Fixed content-card path to pass `href` |
| `apps/web/src/utils/prop-mappers/map-rich-text.ts` | Merges full mapped link into mark defs |
| `packages/design-system/src/utils/get-external-link-icon.ts` | Design-system icon helper (new) |
| `RichText`, `IllustrationCard`, `BipcButton` | Use `getExternalLinkIcon()` instead of `linkType` alone 

**Concept:** Domain-based icon suppression — show ↗ from the **destination domain**, not the CMS **link type** alone.