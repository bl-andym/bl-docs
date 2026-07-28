**File:** apps/web/src/utils/prop-mappers/map-text-card-banner.ts
**Block:** mapTextCardBanner
**Feature:** WFP1-894 Domain-based icon suppression

---

## 1. SUMMARY OF CHANGES

The cards mapping inside mapTextCardBanner was updated so that the mapped link is computed once and its href is passed to getLinkIcon. A local variable mappedLink holds the result of card.link ? mapLink(card.link) : undefined. The return object uses mappedLink for the link property and getLinkIcon(card.link.linkType, mappedLink?.href) for linkIcon. This enables domain-based suppression of the external link icon for text card banner cards whose link targets bl.uk or *.bl.uk. No imports, types, or function signatures were added or removed.

---

## 2. CHANGE 1: INTRODUCTION OF mappedLink AND SINGLE mapLink INVOCATION

BEFORE:

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

AFTER:

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

getLinkIcon (map-link.ts) accepts an optional second parameter href. When linkType is 'external', it uses href to decide whether to return undefined for bl.uk or *.bl.uk. The caller must supply the resolved link URL, which is the mapped link's href. By computing mapLink(card.link) once and storing it in mappedLink, we use the same value for the link property and for getLinkIcon(..., mappedLink?.href), avoiding a second mapLink call and ensuring the icon decision uses the same href the user will navigate to.

CLASSIFICATION: Refactor (single mapLink, reuse for link and icon). New feature (domain-based icon suppression for text card banner cards).

NEW VARIABLE:

  mappedLink. Type: DsLinkData | undefined (inferred from mapLink return type). Holds the result of card.link ? mapLink(card.link) : undefined. Used as the link property and as the source of href for getLinkIcon.

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

Passing mappedLink?.href supplies the resolved URL for the card's link so that getLinkIcon can apply the bl.uk check for external links. When the link is internal or asset, the second argument is ignored by getLinkIcon. When mappedLink is undefined (no card.link), href is undefined and getLinkIcon is not called (the ternary yields undefined).

CLASSIFICATION: New feature.

---

## 4. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added. No new types were introduced. The only new symbol is the local variable mappedLink inside the map callback. No package or dependency changes.

---

## 5. BEHAVIOURAL IMPACT

Before: Every external link on a text card banner card showed the external link icon.

After: External links whose resolved href has host bl.uk or *.bl.uk do not show the external link icon (getLinkIcon returns undefined). All other external links still show the icon. Internal and asset link behaviour is unchanged. The returned card object shape is unchanged; only the linkIcon value for external bl.uk links can now be undefined instead of 'externalLink'.

---

## 6. RISK AND SIDE EFFECTS

Low risk. mapLink is invoked once per card. Optional chaining (mappedLink?.href) safely handles undefined mappedLink. No changes to the rest of mapTextCardBanner or to callers. If getLinkIcon does not accept a second parameter, the extra argument is ignored and behaviour reverts to always showing the external icon for external links.
