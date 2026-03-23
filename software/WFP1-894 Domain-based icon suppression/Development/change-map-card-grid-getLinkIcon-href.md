# Formal Change Documentation: map-card-grid.ts

**File:** `apps/web/src/utils/prop-mappers/map-card-grid.ts`

---

## 1. SUMMARY OF CHANGES

Two internal functions were updated so that getLinkIcon receives the mapped link's href for domain-based icon behaviour (suppress external link icon for bl.uk and *.bl.uk). In mapBaseCard, a local variable mappedLink holds the result of mapLink(card.link); it is used for the link property and for getLinkIcon(..., mappedLink?.href). In mapContentCard, the result of mapBaseCard(card) is stored in base and getLinkIcon is called with base.link?.href; the return object spreads base and overrides linkIcon. No imports, types, or exported function signatures were added or removed.

---

## 2. CHANGE 1: mapBaseCard — INTRODUCTION OF mappedLink AND getLinkIcon WITH href

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

getLinkIcon (map-link.ts) accepts an optional second parameter href. When linkType is 'external', it uses href to decide whether to return undefined for bl.uk or *.bl.uk. The caller must supply the resolved link URL. By computing mapLink(card.link) once and storing it in mappedLink, we use the same object for the link property and for getLinkIcon(..., mappedLink?.href), avoiding a second mapLink call and ensuring the icon decision uses the same href the user will navigate to.

CLASSIFICATION: Refactor (single mapLink, reuse for link and icon). New feature (domain-based icon suppression for external links).

NEW VARIABLE:

  mappedLink. Type: DsLinkData | undefined (inferred from mapLink). Used as link in the return object and as the source of href for getLinkIcon.

---

## 3. CHANGE 2: mapContentCard — STORE mapBaseCard RESULT AND PASS base.link?.href TO getLinkIcon

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

AFTER:

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

RATIONALE:

mapContentCard overrides linkIcon after calling mapBaseCard. To pass the resolved href to getLinkIcon, we need the mapped link; that is the link property returned by mapBaseCard. By storing the result of mapBaseCard(card) in base, we can pass base.link?.href to getLinkIcon and then return { ...base, linkIcon }. This reuses the already-computed mapped link from mapBaseCard and does not call mapBaseCard twice (we call it once and spread base).

CLASSIFICATION: Refactor. New feature (domain-based icon suppression for content cards with external links).

NEW VARIABLE:

  base. Type: return type of mapBaseCard(card). Holds the full mapped card object so we can read base.link?.href and spread ...base in the return.

---

## 4. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added. No new types were introduced. The only new symbols are the local variables mappedLink (in mapBaseCard) and base (in mapContentCard). No package or dependency changes.

---

## 5. BEHAVIOURAL IMPACT

Before: All external links on grid cards (base cards and content cards) showed the external link icon.

After: External links whose resolved href has host bl.uk or *.bl.uk do not show the external link icon (getLinkIcon returns undefined). Other external links still show the icon. Internal links are unchanged. The returned card object shape is unchanged; only the linkIcon value for external bl.uk links can now be undefined.

---

## 6. RISK AND SIDE EFFECTS

Low risk. mapBaseCard still returns the same shape; mapLink is invoked once per card in mapBaseCard. mapContentCard calls mapBaseCard once and uses its result for both href and the spread; no double invocation of mapBaseCard. Optional chaining (mappedLink?.href, base.link?.href) safely handles undefined. No changes to mapCardGrid or to callers of this module.
