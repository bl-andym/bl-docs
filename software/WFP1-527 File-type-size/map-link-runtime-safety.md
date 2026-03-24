**File:** `apps/web/src/utils/prop-mappers/map-link.ts`  
**Block:** Runtime Safety & Type Narrowing Fix
**Feature:** WFP1-527 asset file type and size display

## Bird's-eye view

This change fixes a **runtime crash risk** when handling partially
populated CMS data and improves **TypeScript narrowing correctness**.

The issue stemmed from unsafe use of the `in` operator on a value that
could be `null` or `undefined`.

## Problem Summary

The original implementation assumed that:

``` ts
'asset' in link
```

implies:

``` ts
link.asset is a valid object
```

This is **not true**.

A property can exist but still be:

``` ts
{ asset: undefined }
{ asset: null }
```

Using the `in` operator on such values causes a runtime error.

## Before (Unsafe)

**File:** `map-link.ts`

``` ts
case 'asset': {
  if (!('asset' in link) || !('assetType' in link.asset)) {
    return undefined;
  }

  return {
    href: createDownloadurl(link),
    openInNewTab: false,
    linkType: 'asset',
  };
}
```

### Why this is risky

1.  'asset' in link → only checks property existence\
2.  link.asset may still be null or undefined\
3.  'assetType' in link.asset → can throw

## After (Safe)

**File:** `map-link.ts`

``` ts
case 'asset': {
  if (!('asset' in link) || !link.asset || !('assetType' in link.asset)) {
    return undefined;
  }

  return {
    href: createDownloadurl(link),
    openInNewTab: false,
    linkType: 'asset',
  };
}
```

## Additional Context: File Size & Type Handling

Displaying file metadata (size/type) requires a valid asset object. Even
after GROQ/schema fixes, edge cases may still produce:

``` ts
link.linkType === 'asset'
```

but:

``` ts
link.asset === undefined | null
```

This change:

-   does NOT add metadata handling\
-   DOES prevent runtime crashes

Without the guard:

``` ts
'assetType' in link.asset
```

can throw before UI renders.

## Net Effect

-   Prevents runtime crashes\
-   Handles malformed CMS data safely\
-   Ensures fail-safe behavior\
-   Protects UI rendering paths

## Key Takeaway

The `in` operator checks property existence --- not value validity.
