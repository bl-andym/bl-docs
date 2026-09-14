**File:** `apps/web/src/utils/prop-mappers/map-link.ts`
**Block:** Runtime safety and type narrowing (`mapLink` asset branch)
**Feature:** WFP1-527 asset file type and size display

## Bird's-eye view

This change fixes a **runtime crash** when handling partially populated CMS asset links and improves **TypeScript narrowing**.

The issue was unsafe use of the `in` operator on a value that can be `null`.

`mapLink` turns a CMS link (`internal` / `external` / `asset`) into `DsLinkData` (`href`, `linkType`, `openInNewTab`). For assets it builds a download URL via `createDownloadurl`.

This change does **not** add file format or size to labels (that is `mapRichText` / `mapButton`). It only prevents a throw when an asset link has no resolved file or image.

## Problem summary

The original implementation assumed that:

```ts

'asset' in link

```

implies:

```ts

link.asset is a valid object

```

That is **not** true. A property can exist and still be:

```ts

{ asset: undefined }

{ asset: null }

```

GROQ can return `{ linkType: 'asset', asset: null }` when:

- Link type is Asset but no file/image is chosen
- The file/image was cleared and type left as Asset
- The referenced asset was unpublished or deleted  

`'asset' in link` is then **true**. `'assetType' in link.asset` becomes `'assetType' in null` and throws:

`Cannot use 'in' operator to search for 'assetType' in null`

Because `mapLink` is used across cards, buttons, rich text, and footer, one incomplete asset link could take down a page (or the whole layout, if it was in footer copyright).

## Before (unsafe)

```ts

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


**Rationale (before):** The guard assumed that if the `asset` **key** existed, `link.asset` was an object with `assetType`. That is true for a complete GROQ payload, not for a null payload.

**Why this is risky:**

1. `'asset' in link` only checks property existence
2. `link.asset` may still be `null` or `undefined`
3. `'assetType' in link.asset` can throw
## After (safe)

```ts

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

| Check | Meaning |
| --- | --- |
| `!('asset' in link)` | No `asset` property (incomplete TypeScript union member) |
| `!link.asset` | Property exists but is `null` / missing payload |
| `!('assetType' in link.asset)` | Object present but not a resolved image/file asset |

Any of these → `undefined` (no link), same as an unusable internal link with no `href`. Complete asset links are unchanged: still `createDownloadurl` → `/api/download/…` or CDN `?dl`.
## Rationale (after)

The `!link.asset` guard ensures `link.asset` is not `null` or `undefined` before using `in`.

- `'asset' in link` only guarantees the property exists — not that it has a usable value
- Without this guard, `'assetType' in link.asset` can throw at runtime
- This protects against malformed or partially populated CMS data
- Footer and other surfaces now run more portable text through `mapLink`, so an empty asset must not crash 

**Net effect:** fail safely (`undefined`) instead of breaking execution.
## Additional context: file size and type

Displaying file metadata (size/type) requires a valid asset object. Even after GROQ/schema work, edge cases may still produce:

  

```ts

link.linkType === 'asset'

```

  

but:

  

```ts

link.asset === null | undefined

```

  

This change:

  

- does **not** add metadata handling

- **does** prevent runtime crashes

  

Without the guard, `'assetType' in link.asset` can throw before the UI renders.

  

## Impact on other components

  

Shared by every caller of `mapLink`. Valid CMS asset links behave as before. Only incomplete asset links change: they no longer throw; they render as non-links.

  

## Where it is used

  

Exported from `apps/web/src/utils/prop-mappers/map-link.ts`. Callers include `mapButton`, `mapRichText`, `mapFooter` (social/secondary — not assets in CMS), card/list/logo mappers, and navigation.

  

## Key takeaway

  

The `in` operator checks property **existence**, not value validity.