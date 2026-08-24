# WFP1-894

**File:** `apps/web/src/utils/link-utils.ts`
**Feature:** WFP1-894 Domain-based icon suppression
**Scope:** Round 1 history of `isBLUkDomain`; current role of this file after Round 2

---
## 1. Summary

### Round 1
`isBLUkDomain(href: string)` was **added to this file**. It parsed a URL and returned `true` when the hostname was `bl.uk` or ended with `.bl.uk`. Existing asset helpers were unchanged.
### Round 2
The **implementation moved** to `packages/common/src/utils/is-bl-uk-domain.ts` so design-system could share the same logic. The re-export from this file was **removed**; `map-link.ts` now imports directly from `@bl-web/common`.
### Current role of this file

**Asset/download helpers only.** It no longer defines or exports `isBLUkDomain`.

```ts
import type { DsAssetData } from '@bl-web/design-system/types';

export const filesizeToString = ...
export const getAssetMetadata = ...
export const getAssetLabelWithMetadata = ...
export const getAssetTitleWithCreditLine = ...

```

---
## 2. Round 1: original isBLUkDomain implementation (historical)

This code lived in `link-utils.ts` until Round 2:

```ts
export const isBLUkDomain = (href: string): boolean => {

try {

const host = new URL(href).hostname;

return host === 'bl.uk' || host.endsWith('.bl.uk');

} catch {

return false;

}

};

```

**Rationale:** Single place to detect BL organisation URLs for domain-based icon suppression. Try/catch ensures invalid URLs return `false` without throwing.

---

## 3. Round 2: why the implementation left this file

`IllustrationCard`, `BipcButton`, and `RichText` live in **`packages/design-system`**. Design-system **cannot import from `apps/web`** (circular dependency: web → design-system → web).

Both packages depend on **`@bl-web/common`**, so the domain check belongs there:

```

@bl-web/common/is-bl-uk-domain.ts ← single implementation
          ↑           |      ↑
design-system         |   apps/web
(getExternalLinkIcon) |   (map-link.ts — direct import)

```

`link-utils.ts` is **not** in this path anymore.

### Before (Round 1)

`isBLUkDomain` lived only in the web app:

```
apps/web/link-utils.ts  ← defined isBLUkDomain here
         ↑
    map-link.ts → getLinkIcon()
         ↑
   prop mappers (buttons, cards, etc.)

design-system  ← no access (can't import apps/web)
RichText, etc.   ← linkType === 'external' only → always ↗
```

### Middle (Round 2, with re-export)

Logic moved to `common`, but web still imported via `link-utils`:

```
@bl-web/common/is-bl-uk-domain.ts  ← single implementation
         ↑                    ↑
design-system              link-utils.ts (re-export)
(getExternalLinkIcon)         ↑
                           map-link.ts → getLinkIcon()
```

Extra hop: `common → link-utils → map-link`

### Now (current, simplified)

Re-export removed, both consumers import from `common` directly:

```
@bl-web/common/is-bl-uk-domain.ts  ← single implementation
         ↑                    ↑
design-system              map-link.ts
(getExternalLinkIcon)      (getLinkIcon)

link-utils.ts  →  asset helpers only (filesize, metadata, etc.)
                 no isBLUkDomain
```

### One-line summary

**Before:** domain check in web only; design-system couldn't use it.  
**Middle:** shared in `common`, but web went through a re-export shim.  
**Now:** one implementation in `common`; web and design-system import it directly; `link-utils.ts` is back to asset helpers only.


---
## 4. isBLUkDomain behaviour (now in common)

**File:** `packages/common/src/utils/is-bl-uk-domain.ts`
**Tests:** `packages/common/src/utils/is-bl-uk-domain.test.ts`

| Input | Result |
|-------|--------|
| `http://bl.uk` | `true` |
| `https://www.bl.uk/foo` | `true` |
| `https://iiif.bl.uk/uv/#?manifest=...` | `true` |
| `https://google.com` | `false` |
| `/about` (relative) | `false` |
| Invalid string | `false` |

Unit testing **isBLUkDomain**:
```
cd packages/common && npm run test -- is-bl-uk-domain

//From the repo root:
npm run test -w @bl-web/common -- is-bl-uk-domain
```

---
## 5. Usage and integration

### Who uses isBLUkDomain

| Consumer | Import path |
|----------|-------------|
| `map-link.ts` → `getLinkIcon()` | `@bl-web/common/utils/is-bl-uk-domain` |
| `get-external-link-icon.ts` (design-system) | `@bl-web/common/utils/is-bl-uk-domain` 

### Who uses link-utils.ts (this file)

Asset helpers only — no domain check:

| Consumer | Uses |
|----------|------|
| `map-button.ts`, `map-rich-text.ts` | `getAssetLabelWithMetadata` |
| `map-list-card-grid-and-banner.ts`, `map-media-download-grid.ts` | `getAssetMetadata`, `getAssetTitleWithCreditLine` |

---
## 6. Edge cases and risk

**Edge cases:**  invalid/relative URLs return `false`.

**Risk:** Low. Round 2 removal of `isBLUkDomain` from this file does not affect asset-helper callers. Domain logic is unchanged; only its module location changed.

---
## 7. Related files (WFP1-894)

| File | Role |
|------|------|
| `packages/common/src/utils/is-bl-uk-domain.ts` | Domain check implementation |
| `apps/web/src/utils/prop-mappers/map-link.ts` | `getLinkIcon()` — web icon decision |
| `packages/design-system/src/utils/get-external-link-icon.ts` | Design-system icon decision |
| `RichText`, `IllustrationCard`, `BipcButton` | Components using `getExternalLinkIcon()` |

**Concept:** Domain-based icon suppression, decide external icon (↗) from **destination domain**, not CMS **link type** alone.