**File:** `apps/web/src/utils/prop-mappers/map-list-card-grid-and-banner.ts`  
**Block:** runtime-safe link handling
**Feature:** WFP1-527 asset file type and size display

## Bird's-eye view

This change refactors how **asset metadata (file size/type)** is applied
to ListCard items and aligns with the updated **runtime-safe link
handling** introduced in `mapLink`.

Key improvements:

-   Moves asset metadata display from `surtitle` → `title`
-   Removes unsafe inline asset checks
-   Aligns with defensive patterns for partially populated CMS data
-   Introduces `getAssetLabelWithMetadata` for consistent formatting

------------------------------------------------------------------------

## Before (Unsafe / Coupled Metadata Logic)

**File:** `map-list-card-grid-or-banner.ts`

``` ts
const assetMetadata =
  (link && 'asset' in link && 'assetType' in link.asset && getAssetMetadata(link.asset)) || undefined;

return {
  ...item,
  link: mappedLink,
  linkIcon: link?.linkType !== 'internal' ? getLinkIcon(link?.linkType) : undefined,
  surtitle: item.surtitle || assetMetadata,
  thumbnail: item.thumbnail ? mapImage(item.thumbnail as ImageFragment) : undefined,
};
```

------------------------------------------------------------------------

## After (Safe / Decoupled / Explicit)

``` ts
const baseTitle = item.title;

const finalTitle =
  baseTitle && link?.linkType === 'asset' && 'asset' in link && 'assetType' in link.asset
    ? getAssetLabelWithMetadata(link.asset, baseTitle)
    : baseTitle;

return {
  ...item,
  link: mappedLink,
  linkIcon: link?.linkType !== 'internal' ? getLinkIcon(link?.linkType) : undefined,
  title: finalTitle,
  surtitle: item.surtitle,
  thumbnail: item.thumbnail ? mapImage(item.thumbnail as ImageFragment) : undefined,
};
```

------------------------------------------------------------------------

## Fix: Append file size/type to title if both title and asset metadata exist

``` ts
const finalTitle =
  baseTitle &&
  link?.linkType === 'asset' &&
  'asset' in link &&
  link.asset &&
  'assetType' in link.asset
    ? getAssetLabelWithMetadata(link.asset, baseTitle)
    : baseTitle;
```

------------------------------------------------------------------------

## Net Effect

-   Prevents runtime crashes from unsafe property access\
-   Improves separation of concerns\
-   Ensures consistent metadata handling
