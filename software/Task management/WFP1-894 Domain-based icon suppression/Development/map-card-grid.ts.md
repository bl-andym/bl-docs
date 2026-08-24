**File:** apps/web/src/utils/prop-mappers/map-card-grid.ts
**Block:** mapBaseCard, mapContentCard
**Feature:** WFP1-894 Domain-based icon suppression

---
## 1. SUMMARY OF CHANGES

**Round 1:** `mapBaseCard` was updated so that `getLinkIcon` receives the mapped link's `href` for domain-based icon behaviour (suppress external link icon for `bl.uk` and `*.bl.uk`). A local variable `mappedLink` holds the result of `mapLink(card.link)`; it is used for the `link` property and for `getLinkIcon(..., mappedLink?.href)`.

**Round 2:** `mapContentCard` was simplified to `return mapBaseCard(card)`. Content cards no longer recompute or override `linkIcon` separately — they inherit the correct icon logic from `mapBaseCard`. This fixed a bug where content cards on regular card grids still showed the external link icon for BL domains.

No imports, types, or exported function signatures were added or removed.

---
## 2. CHANGE 1 (Round 1): mapBaseCard — INTRODUCTION OF mappedLink AND getLinkIcon WITH href

BEFORE:
```ts

const mapBaseCard = (card: CardGridItem) => {

const linkIcon =

card.link && 'linkType' in card.link && card.link.linkType !== 'internal'

? getLinkIcon(card.link?.linkType)

: undefined;

return {

...card,

link: card.link ? mapLink(card.link) : undefined,

linkIcon,

hub: card.hubs,

shape: card.shape ? stripPresentationModeEncodedDataFromString(card.shape) : undefined,

image: mapImage(card.image as ImageFragment, undefined, shapeToHeightMultiplier(card.shape)),

};

};

```

  

AFTER:
```ts

const mapBaseCard = (card: CardGridItem) => {

const mappedLink = card.link ? mapLink(card.link) : undefined;

const linkIcon =

card.link && 'linkType' in card.link && card.link.linkType !== 'internal'

? getLinkIcon(card.link?.linkType, mappedLink?.href)

: undefined;

return {

...card,

link: mappedLink,

linkIcon,

hub: card.hubs,

shape: card.shape ? stripPresentationModeEncodedDataFromString(card.shape) : undefined,

image: mapImage(card.image as ImageFragment, undefined, shapeToHeightMultiplier(card.shape)),

};

};

```

  

RATIONALE:
`getLinkIcon` (in `map-link.ts`) accepts an optional second parameter `href`. When `linkType` is `'external'`, it uses `href` to decide whether to return `undefined` (no icon) for `bl.uk` or `*.bl.uk` via `isBLUkDomain` in `@bl-web/common`. The caller must supply the resolved link URL. By computing `mapLink(card.link)` once and storing it in `mappedLink`, we use the same object for the `link` property and for `getLinkIcon(..., mappedLink?.href)`, avoiding a second `mapLink` call and ensuring the icon decision uses the same `href` the user will navigate to.

CLASSIFICATION: 
Refactor (single `mapLink`, reuse for link and icon). New feature (domain-based icon suppression for external links).

NEW VARIABLE:
`mappedLink`. Type: `DsLinkData | undefined` (inferred from `mapLink`). Used as `link` in the return object and as the source of `href` for `getLinkIcon`.

---
## 3. CHANGE 2 (Round 1 → Round 2): mapContentCard — DELEGATE TO mapBaseCard

### Round 1

BEFORE:
```ts

const mapContentCard = (card: Extract<CardGridItem, { _type: 'object:contentCard' }>) => {

const linkIcon =

card.link && 'linkType' in card.link && card.link.linkType !== 'internal'

? getLinkIcon(card.link?.linkType)

: undefined;

return {

...mapBaseCard(card),

linkIcon,

};

};

```


Round 1 fix:

```ts
const mapContentCard = (card: Extract<CardGridItem, { _type: 'object:contentCard' }>) => {

const base = mapBaseCard(card);

const linkIcon =

card.link && 'linkType' in card.link && card.link.linkType !== 'internal'

? getLinkIcon(card.link?.linkType, base.link?.href)

: undefined;

return {

...base,

linkIcon,

};

};

```

Problem: 
The original Round 1 code called `mapBaseCard` then overwrote `linkIcon` without `href`, so content cards on regular card grids still showed ↗ for BL URLs. The intermediate fix with `base` worked but duplicated logic already present in `mapBaseCard`.

### Round 2 (current)

AFTER:

```ts

const mapContentCard = (card: Extract<CardGridItem, { _type: 'object:contentCard' }>) => {

return mapBaseCard(card);

};

```

  

RATIONALE:
`mapBaseCard` already computes `linkIcon` using `mappedLink?.href`. `mapContentCard` does not need its own `getLinkIcon` call or `linkIcon` override. Delegating to `mapBaseCard` removes duplicate logic, avoids calling `mapBaseCard` twice, and ensures content cards and editorial cards share the same icon behaviour.

CLASSIFICATION: 
Bug fix / refactor (Round 2). No new feature.

  REMOVED VARIABLE:
  `base` from Round 1 dev.

---
## 4. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added to this file. No new types were introduced. The only new symbol from Round 1 is the local variable `mappedLink` in `mapBaseCard`.

Domain check is indirect: 
`getLinkIcon` in `map-link.ts` imports `isBLUkDomain` from `@bl-web/common/utils/is-bl-uk-domain`. This file does not import `@bl-web/common` directly.

No package or dependency changes in this file.

---
## 5. BEHAVIOURAL IMPACT

Before: 
All external links on grid cards (base cards and content cards) showed the external link icon.

After: 
External links whose resolved `href` has host `bl.uk` or ends with `.bl.uk` do not show the external link icon (`getLinkIcon` returns `undefined`). Other external links still show the icon. Internal links are unchanged. The returned card object shape is unchanged; only the `linkIcon` value for external BL-domain links can now be `undefined`.

Content cards and editorial cards now behave identically for link icons (both go through `mapBaseCard`).

---
## 6. RISK AND SIDE EFFECTS

Low risk. `mapBaseCard` still returns the same shape; `mapLink` is invoked once per card in `mapBaseCard`. `mapContentCard` calls `mapBaseCard` once with no additional `linkIcon` override. Optional chaining (`mappedLink?.href`) safely handles undefined `mappedLink`. No changes to `mapCardGrid` or to callers of this module.

---
## 7. ROUND SUMMARY

| Round | Change |
|-------|--------|
| Round 1 | `mapBaseCard`: `mappedLink` + `getLinkIcon(..., mappedLink?.href)` |
| Round 2 | `mapContentCard`: simplified to `return mapBaseCard(card)` |
