**File:** `apps/web/src/utils/prop-mappers/map-media-download-grid.ts`  
**Block:** runtime-safe link handling
**Feature:** WFP1-527 asset file type and size display

## Summary Assessment

At a high level, the mapper has shifted from:

-   using `surtitle` as an auto-generated metadata channel
-   to using `title` as the primary display surface for asset metadata
-   while reserving `surtitle` for explicit CMS-authored content

This is a sensible separation of concerns. It improves editorial control
and makes the UI intent clearer.

------------------------------------------------------------------------
## Purpose

Maps a CMS `MediaDownloadGrid` block into `MediaDownloadGridProps` for
the design-system component.

**Key responsibility shift (this change):** - Enriches **title** with
asset metadata (file type/size) when possible. - Treats **surtitle as
explicitly CMS-authored content**, no longer as a generated metadata
field.

------------------------------------------------------------------------

## Before (behavioural summary)

From the previous implementation:

``` ts
title: getAssetTitleWithCreditLine(item.asset),
surtitle: getAssetMetadata(item.asset),
```

### Behaviour

-   **Title**
    -   Derived from asset title + optional credit line
-   **Surtitle**
    -   Populated from asset metadata
    -   Functioned as a generated metadata field
-   **Metadata placement**
    -   Not appended to title
    -   Provided separately via surtitle

------------------------------------------------------------------------

## After (current behaviour)

### Key changes

### 1. Title enrichment with metadata

``` ts
const baseTitle = item.asset ? getAssetTitleWithCreditLine(item.asset) : undefined;

const finalTitle =
  baseTitle && item.asset && 'assetType' in item.asset
    ? getAssetLabelWithMetadata(item.asset, baseTitle)
    : baseTitle;
```

-   Appends metadata to title when conditions are met

------------------------------------------------------------------------

### 2. Surtitle is CMS-driven

``` ts
surtitle:
  typeof item.surtitle === 'string' && item.surtitle.trim().length > 0
    ? item.surtitle
    : undefined,
```

-   Only uses non-empty CMS values

------------------------------------------------------------------------

### 3. Guarded metadata application

Metadata is applied only when:

``` ts
baseTitle && item.asset && 'assetType' in item.asset
```

------------------------------------------------------------------------

## Rationale

-   **Separation of concerns**
    -   Title = user-facing label + metadata
    -   Surtitle = editorial content
-   **UX clarity**
    -   Metadata appears where users expect it
-   **Editorial control**
    -   CMS authors fully control surtitle
-   **Safety**
    -   Metadata only applied when conditions are valid

------------------------------------------------------------------------

## Observations

-   Metadata condition relies on asset shape (`assetType`)
-   Output formatting depends on helper functions
-   Behaviour change may affect UI snapshots
-   No fallback metadata display if conditions fail

------------------------------------------------------------------------

## Suggested Improvements

-   Remove commented-out legacy code
-   Simplify surtitle assignment into a variable
-   Consider stronger metadata validation instead of shape checks

------------------------------------------------------------------------

Generated: 2026-03-25T09:57:30.742736
