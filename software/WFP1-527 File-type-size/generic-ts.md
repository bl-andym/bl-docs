**File:** `apps/web/src/api/shared/fragments/generic.ts`  
**Block:** `mediaDownloadGrid` → `items[]`  
**Feature:** WFP1-527 asset file type and size display

---

## Before

```groovy
items[] {
  _key,
  "linkType": "asset",
  ${assetFragment},
  "thumbnail": select(
    defined(image) => image {
      ${imageFragment}
    },
    defined(file) => file->thumbnail {
      ${imageFragment}
    }
  )
},
```

**What this did:**  
The fragment used the shared `assetFragment` and thumbnail paths `image` and `file` (and `file->thumbnail`). Those paths only work when the item has **top-level** `image` and `file`.

In the media download grid schema, each item has a single **`asset`** field, and the link is either `asset.image` or `asset.file`. So `image` and `file` are not at the top level; they sit under `asset`. Using top-level `image`/`file` in GROQ did not match this schema and could produce wrong or missing data for href, asset metadata, and thumbnail.

---

## After

```groovy
items[] {
  _key,
  "linkType": "asset",
  "href": select(
    defined(asset.image) => asset.image.asset->url,
    defined(asset.file) => asset.file->file.asset->url
  ),
  "asset": select(
    defined(asset.image) => {
      ...asset.image.asset -> {
        ${baseAssetDataFragment},
        "assetType": "image"
      }
    },
    defined(asset.file) => {
      ...asset.file->file.asset -> {
        ${baseAssetDataFragment},
        "assetType": "file"
      }
    }
  ),
  surtitle,
  "thumbnail": select(
    defined(asset.image) => asset.image {
      ${imageFragment}
    },
    defined(asset.file) => asset.file->thumbnail {
      ${imageFragment}
    }
  )
},
```

**What this does:**

1. **Paths match the schema**  
   All selects use `asset.image` and `asset.file`, so the query matches the media download grid item shape (`item.asset` with either `image` or `file`). No reliance on top-level `image`/`file`.

2. **Explicit `href` and `asset`**  
   Same idea as `assetFragment` (href + asset with `baseAssetDataFragment` and `assetType`), but written for this block's `asset.image` / `asset.file` structure. Ensures each item has `asset.extension` and `asset.size` for file type/size display (e.g. "PDF, 1.2 MB").

3. **`surtitle`**  
   The schema has an optional `surtitle` per item; including it in the fragment lets the front end show it above the title when set in the CMS.

4. **Thumbnail**  
   Thumbnail is resolved from the same structure: `asset.image` for image thumbnail, `asset.file->thumbnail` for file thumbnail.
   
- **Reference (`_ref`)** → can only see the **ID of the referenced document**
- **Dereference (`->`)** → can **read fields from the referenced document**

---

## Summary

| Aspect | Before | After |
| --- | --- | --- |
| Paths | Top-level `image` / `file` | `asset.image` / `asset.file` (matches schema) |
| Structure | Reused `assetFragment` | Inline `href` + `asset` for `asset.image` / `asset.file` |
| Asset data | Via fragment | Via `baseAssetDataFragment` + `assetType` |
| Surtitle | Not requested | `surtitle` included |
| Thumbnail | `image` / `file->thumbnail` | `asset.image` / `asset.file->thumbnail` |

The updated fragment aligns the GROQ with the media download grid schema and supports WFP1-527 (asset file type/size and optional surtitle). Use the "After" version in `generic.ts` for the media download grid `items[]` fragment.
