**File:** apps/web/src/utils/prop-mappers/map-list-card-grid-and-banner.ts
**Block:** getLinkIcon inside mapListCardGridOrBanner
**Feature:** WFP1-894 Domain-based icon suppression

---

## 1. SUMMARY OF CHANGES

A single call to getLinkIcon inside mapListCardGridOrBanner was updated to pass the mapped link's href as the second argument. The items map already computed mappedLink via mapLink(link) and used it for the link property; no new variables or structure changes were required. Passing mappedLink?.href to getLinkIcon enables domain-based suppression of the external link icon for list card items whose link targets bl.uk or *.bl.uk. No imports, types, or function signatures were added or removed.

---

## 2. CHANGE 1: getLinkIcon CALL NOW RECEIVES SECOND ARGUMENT (mappedLink?.href)

BEFORE:

```ts
  const mappedItems: ListCardProps[] | undefined = listCardGridOrBanner.items?.map(item => {
    const link = item.link;
    const mappedLink = mapLink(link);

    const assetMetadata =
      (link && 'asset' in link && 'assetType' in link.asset && getAssetMetadata(link.asset)) || undefined;

    return {
      ...item,
      link: mappedLink,
      linkIcon: link?.linkType !== 'internal' ? getLinkIcon(link?.linkType) : undefined,
      surtitle: item.surtitle || assetMetadata,
      thumbnail: item.thumbnail ? mapImage(item.thumbnail as ImageFragment) : undefined,
    };
  });
```

AFTER:

```ts
  const mappedItems: ListCardProps[] | undefined = listCardGridOrBanner.items?.map(item => {
    const link = item.link;
    const mappedLink = mapLink(link);

    const assetMetadata =
      (link && 'asset' in link && 'assetType' in link.asset && getAssetMetadata(link.asset)) || undefined;

    return {
      ...item,
      link: mappedLink,
      linkIcon: link?.linkType !== 'internal' ? getLinkIcon(link?.linkType, mappedLink?.href) : undefined,
      surtitle: item.surtitle || assetMetadata,
      thumbnail: item.thumbnail ? mapImage(item.thumbnail as ImageFragment) : undefined,
    };
  });
```

RATIONALE:

getLinkIcon (map-link.ts) accepts an optional second parameter href. When linkType is 'external', it uses href to decide whether to return undefined for bl.uk or *.bl.uk. The items map already had mappedLink in scope (from mapLink(link)); passing mappedLink?.href supplies the resolved URL so that getLinkIcon can apply the domain check. When link is internal, the conditional does not call getLinkIcon. When link is external or asset, the second argument is used only for external (getLinkIcon ignores href for asset). When mappedLink is undefined, href is undefined and getLinkIcon behaves as before for external (returns 'externalLink').

CLASSIFICATION: New feature (domain-based icon suppression for list card grid and banner items).

---

## 3. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added. No new types were introduced. No new variables were added; mappedLink was already present and is now used as the source of href in addition to its existing use as the link property. No package or dependency changes.

---

## 4. BEHAVIOURAL IMPACT

Before: Every external link on a list card (grid or banner) showed the external link icon.

After: External links whose resolved href has host bl.uk or *.bl.uk do not show the external link icon (getLinkIcon returns undefined). All other external links still show the icon. Internal and asset link behaviour is unchanged. The returned item object shape is unchanged; only the linkIcon value for external bl.uk links can now be undefined instead of 'externalLink'.

---

## 5. RISK AND SIDE EFFECTS

Low risk. The change is a single additional argument to an existing function call. mappedLink is already computed and in scope; optional chaining (mappedLink?.href) safely handles undefined mappedLink. No change to the number of mapLink invocations or to the structure of the returned data. No changes to mapListCardGridOrBanner's signature or to callers. If getLinkIcon does not accept a second parameter, the extra argument is ignored and behaviour reverts to always showing the external icon for external links.
