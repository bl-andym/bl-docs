# Formal Change Documentation: map-hub-hero-banner.ts

**File:** `apps/web/src/utils/prop-mappers/map-hub-hero-banner.ts`

---

## 1. SUMMARY OF CHANGES

The buttons mapping inside mapHubHeroBanner was refactored so that the result of mapButton(b) is stored in a local variable and the mapped link's href is passed to getLinkIcon. The map callback was changed from an arrow function returning an object literal to a block that assigns mapButton(b) to mapped, then returns an object that spreads mapped and sets icon via getLinkIcon(b.link?.linkType, mapped?.link?.href). This enables domain-based suppression of the external link icon for buttons whose link targets bl.uk or *.bl.uk. No imports, types, or function signatures were added or removed.

---

## 2. CHANGE 1: BUTTONS MAP CALLBACK FROM ARROW EXPRESSION TO BLOCK WITH LOCAL VARIABLE

BEFORE:

```ts
    buttons: compact(
      heroBanner?.buttons?.map(b => ({
        ...mapButton(b),
        // map button by default doesn't show icon for internal links, but we want it here
        icon: getLinkIcon(b.link?.linkType),
        id: b._key,
      })) ?? [],
    ),
```

AFTER:

```ts
    buttons: compact(
      heroBanner?.buttons?.map(b => {
        const mapped = mapButton(b);
        return {
          ...mapped,
          // map button by default doesn't show icon for internal links, but we want it here
          icon: getLinkIcon(b.link?.linkType, mapped?.link?.href),
          id: b._key,
        };
      }) ?? [],
    ),
```

RATIONALE:

getLinkIcon (map-link.ts) accepts an optional second parameter href. When linkType is 'external', it uses href to decide whether to return undefined for bl.uk or *.bl.uk. The caller must supply the resolved link URL, which is the mapped button's link.href (i.e. the link returned by mapButton(b)). Storing mapButton(b) in mapped allows us to pass mapped?.link?.href to getLinkIcon and to spread ...mapped in the returned object. The block body is required so that mapped is in scope for both the icon expression and the spread.

CLASSIFICATION: Refactor (enables passing href). New feature (domain-based icon suppression for hub hero banner buttons).

NEW VARIABLE:

  mapped. Type: DsLinkButtonData | undefined (inferred from mapButton return type). Holds the result of mapButton(b). Used for ...mapped and for mapped?.link?.href in the getLinkIcon call.

---

## 3. CHANGE 2: getLinkIcon CALL NOW RECEIVES SECOND ARGUMENT

BEFORE:

```ts
        icon: getLinkIcon(b.link?.linkType),
```

AFTER:

```ts
          icon: getLinkIcon(b.link?.linkType, mapped?.link?.href),
```

RATIONALE:

Passing mapped?.link?.href supplies the resolved URL for the button's link so that getLinkIcon can apply the bl.uk check for external links. When the link is internal or asset, the second argument is ignored by getLinkIcon. When mapped or mapped.link is undefined, the second argument is undefined and getLinkIcon behaves as before for external (returns 'externalLink').

CLASSIFICATION: New feature.

---

## 4. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added. No new types were introduced. The only new symbol is the local variable mapped inside the map callback. No package or dependency changes.

---

## 5. BEHAVIOURAL IMPACT

Before: Every external link on a hub hero banner button showed the external link icon.

After: External links whose resolved href has host bl.uk or *.bl.uk do not show the external link icon (getLinkIcon returns undefined). All other external links still show the icon. Internal and asset link behaviour is unchanged. The returned button object shape is unchanged; only the icon value for external bl.uk links can now be undefined instead of 'externalLink'.

---

## 6. RISK AND SIDE EFFECTS

Low risk. mapButton is invoked once per button. Optional chaining (mapped?.link?.href) safely handles undefined mapped or missing link. No changes to the rest of mapHubHeroBanner or to callers. If getLinkIcon does not accept a second parameter, the extra argument is ignored and behaviour reverts to always showing the external icon for external links.
