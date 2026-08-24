**File:** apps/web/src/utils/prop-mappers/map-text-card-banner.ts
**Block:** mapTextCardBanner
**Feature:** WFP1-894 Domain-based icon suppression

---
## 1. SUMMARY OF CHANGES

**Round 1:** The cards mapping inside `mapTextCardBanner` was updated so that `getLinkIcon` receives the mapped link's `href`. A local variable `mappedLink` holds the result of `card.link ? mapLink(card.link) : undefined`. `getLinkIcon(card.link.linkType, mappedLink?.href)` enables domain-based suppression of the external link icon for text card grid cards whose link targets `bl.uk` or hostnames ending with `.bl.uk`.

**Round 2:** No feature changes. Line 15 updated to `link: mappedLink` to complete the single-`mapLink` refactor (aligned with `map-button.ts`). Domain check remains indirect via `getLinkIcon` → `isBLUkDomain` in `@bl-web/common`.

No imports, types, or exported function signatures were added or removed.

---
## 2. CHANGE 1: INTRODUCTION OF mappedLink AND getLinkIcon WITH href

BEFORE
```ts
const parsedCards = textCardBanner.cards?.map(card => {

return {

...card,

link: card.link ? mapLink(card.link) : undefined,

linkIcon: card.link?.linkType ? getLinkIcon(card.link.linkType) : undefined,

color: card.hub?.color

? (stripPresentationModeEncodedDataFromString(card.hub.color) as unknown as Hub['color'])

: undefined,

};

});

```

  

### AFTER

  

```ts

const parsedCards = textCardBanner.cards?.map(card => {

const mappedLink = card.link ? mapLink(card.link) : undefined;

return {

...card,

link: mappedLink,

linkIcon: card.link?.linkType ? getLinkIcon(card.link.linkType, mappedLink?.href) : undefined,

color: card.hub?.color

? (stripPresentationModeEncodedDataFromString(card.hub.color) as unknown as Hub['color'])

: undefined,

};

});
```

RATIONALE:

`getLinkIcon` (in `map-link.ts`) accepts an optional second parameter `href`. When `linkType` is `'external'`, it uses `href` to decide whether to return `undefined` for `bl.uk` or hostnames ending with `.bl.uk` via `isBLUkDomain` in `@bl-web/common`. Storing `mappedLink` once and passing `mappedLink?.href` ensures the icon decision uses the same resolved URL as the link the user navigates to.

CLASSIFICATION: Refactor (single `mapLink` intended). New feature (domain-based icon suppression).

NEW VARIABLE:
`mappedLink`. Type: `DsLinkData | undefined`. Used as the `link` property and as the source of `href` for `getLinkIcon`.

---
## 3. CHANGE 2: getLinkIcon CALL NOW RECEIVES SECOND ARGUMENT

BEFORE:

```ts
linkIcon: card.link?.linkType ? getLinkIcon(card.link.linkType) : undefined,
```
  
AFTER:

```ts
linkIcon: card.link?.linkType ? getLinkIcon(card.link.linkType, mappedLink?.href) : undefined,
```

RATIONALE:

Passing `mappedLink?.href` supplies the resolved URL for domain checking on external links. When `linkType` is internal or asset, `getLinkIcon` ignores `href`. When `mappedLink` is undefined, the outer ternary yields `undefined` and `getLinkIcon` is not called.

CLASSIFICATION: New feature.

---
## 4. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added to this file. No new types were introduced. The only new symbol is the local variable `mappedLink` inside the map callback.

Domain-based icon suppression is applied indirectly: this file calls `getLinkIcon` in `map-link.ts`, which imports `isBLUkDomain` from `@bl-web/common/utils/is-bl-uk-domain`. This file does not import `@bl-web/common` directly.

No package or dependency changes in this file.

---
## 5. BEHAVIOURAL IMPACT

Before: Every external link on a text card grid card showed the external link icon.

After: External links whose resolved `href` has host `bl.uk` or ends with `.bl.uk` do not show the external link icon (`getLinkIcon` returns `undefined`). All other external links still show the icon. Internal and asset link behaviour is unchanged. The returned card object shape is unchanged; only the `linkIcon` value for external BL-domain links can now be `undefined` instead of `'externalLink'`.

The grid-level `button` is mapped via `mapButton`, which applies the same domain-based icon logic independently.

---  
## 6. RISK AND SIDE EFFECTS

Low risk. `mapLink` is invoked once per card. Optional chaining (`mappedLink?.href`) safely handles undefined `mappedLink`. No changes to `mapTextCardBanner`'s signature or to callers.

```ts
getLinkIcon(linkType?: 'external' | 'internal' | 'asset', href?: string)

// Before: getLinkIcon(card.link.linkType)

// After: getLinkIcon(card.link.linkType, mappedLink?.href)
```