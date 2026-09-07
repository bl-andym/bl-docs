# WFP1-894 — Domain-Based Icon Suppression

Summary of changes to file. External links to `bl.uk` or `*.bl.uk` no longer show the ↗ icon; CMS `linkType` remains `'external'`.

---
## link-utils.ts

Round 2: `isBLUkDomain` was removed from `link-utils.ts` and moved to `@bl-web/common/utils/is-bl-uk-domain.ts`. This file now only holds asset helpers (`filesizeToString`, `getAssetMetadata`, `getAssetLabelWithMetadata`, `getAssetTitleWithCreditLine`); domain checks are done via `map-link.ts` and `get-external-link-icon.ts`, which import from common.

`isBLUkDomain` was moved to `@bl-web/common` so both apps/web (`map-link.ts` → `getLinkIcon`) and design-system (`get-external-link-icon.ts`) can share one domain check via a neutral package, instead of living in app-only `link-utils.ts`, which would force design-system to import from apps/web and risk a cyclic dependency (`apps/web` → `design-system` → `apps/web`).

---
## map-button.ts

`mapButton` now calls `mapLink` once, stores the result in `mappedLink`, passes `mappedLink?.href` into `getLinkIcon` so external BL-domain URLs (`bl.uk` / `*.bl.uk`) get no ↗ icon, and reuses `mappedLink` for the returned `link` in both branches instead of calling `mapLink` again.

“Both branches” means the asset return and the default return, two shapes of button data that share one `mappedLink` result. After mapping the link once, `mapButton` returns either an asset-specific object or a standard button object depending on link type; in both cases it uses the same precomputed `mappedLink` for the `link` property.

---
## map-card-grid.ts

`map-card-grid.ts` was updated in two steps: `mapBaseCard` now stores `mappedLink` once and passes `mappedLink?.href` to `getLinkIcon`, so external links to `bl.uk` / `*.bl.uk` get no ↗ icon; `mapContentCard` was then simplified (Round 2) to `return mapBaseCard(card)` so content cards inherit that logic instead of overriding `linkIcon` without `href`, fixing regular card grids where BL URLs still showed the external icon.

---
## map-link.ts

`getLinkIcon` now accepts an optional `href` and, for external links, calls `isBLUkDomain` from `@bl-web/common`, returning `undefined` (no ↗) when the host is `bl.uk` or ends with `.bl.uk`, and `'externalLink'` otherwise — making this file the central icon decision point that all web prop mappers delegate to via `getLinkIcon(..., mappedLink?.href)`.

---
## map-rich-text.ts

`mapRichText` now merges the full mapped link (`{ ...markDef, ...mappedLink }`) into each link mark definition, not just `linkType`, so inline rich-text links carry the resolved `href` through to design-system `RichText`, which uses `getExternalLinkIcon` to suppress ↗ for `bl.uk` / `*.bl.uk` URLs (e.g. captions in text & image blocks).

---
## map-text-card-banner.ts

`mapTextCardBanner` now stores `mappedLink` once per card, passes `mappedLink?.href` to `getLinkIcon` so external BL-domain URLs get no ↗ icon, and reuses `mappedLink` for the returned `link` — matching the same single-`mapLink` pattern as `map-button.ts`.

---
## is-bl-uk-domain.test.ts

New file (Round 2): adds Vitest coverage for `isBLUkDomain`, confirming `true` for `bl.uk`, subdomains like `iiif.bl.uk`, and hostnames ending in `.bl.uk`; and `false` for other domains, invalid URLs, relative paths like `/about`, and edge cases where `bl.uk` appears in the hostname but the suffix is `-bl.uk` or `.co.uk` rather than `.bl.uk`.

---
## is-bl-uk-domain.ts

New file (Round 2): introduces shared `isBLUkDomain(href)`, which parses the URL hostname and returns `true` when it equals `bl.uk` or ends with `.bl.uk` — the core domain rule used by both `getLinkIcon` and `getExternalLinkIcon` to decide whether to suppress the ↗ icon (extracted from app-only `link-utils.ts` into `@bl-web/common` for reuse without cyclic dependencies).

---
## IllustrationCard/index.tsx

Round 2: `IllustrationCard` no longer shows ↗ for every `linkType === 'external'` link; it calls `getExternalLinkIcon(link.linkType, link.href)` so the icon is only rendered when the URL is external and not a BL domain (`bl.uk` / `*.bl.uk`).

---
## BipcButton/index.tsx

Round 2: `BipcButton` no longer sets `icon: 'externalLink'` whenever `linkType === 'external'`; it passes `getExternalLinkIcon(button?.link?.linkType, button?.link?.href)` to `Button`, so ↗ is suppressed for external links whose `href` is on `bl.uk` or `*.bl.uk`.

---
## RichText/index.tsx

Round 2: `RichText` inline links no longer show ↗ whenever `linkType === 'external'`; the link mark renderer calls `getExternalLinkIcon(linkValue.linkType, linkValue.href)` so ↗ is only shown for truly external URLs, relying on `map-rich-text` to merge the resolved `href` into each mark def (e.g. text & image captions with `https://iiif.bl.uk/...`).

---
## get-external-link-icon.ts

New file (Round 2): adds `getExternalLinkIcon(linkType, href)` for design-system components (`RichText`, `IllustrationCard`, `BipcButton`), mirroring `getLinkIcon` in apps/web — it returns `'externalLink'` only when `linkType` is `'external'` and `isBLUkDomain(href)` is false, otherwise `undefined`, so BL-domain external URLs get no ↗ without design-system depending on apps/web.