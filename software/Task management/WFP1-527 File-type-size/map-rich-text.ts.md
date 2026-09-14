**File:** `apps/web/src/utils/prop-mappers/map-rich-text.ts`
**Block:** `mapRichTextBlockWithLinks` (asset link children)
**Feature:** WFP1-527 asset file type and size display

## Purpose

`mapRichText` walks Sanity portable text, runs each link mark through `mapLink`, and for `linkType: 'asset'` rewrites the linked words with `getAssetLabelWithMetadata` so the visible text is `{title} ({EXT}, {size})`, e.g. `Annual report (PDF, 1.2MB)`.

This change does **not** add that behaviour (it already existed for blocks that called `mapRichText`). It adds the same null guard as `mapLink` so appending metadata does not throw when `asset` is `null`.
## Before

```ts

if (assetLinkMarkDef && 'asset' in assetLinkMarkDef && 'assetType' in assetLinkMarkDef.asset) {

return {

...child,

text: getAssetLabelWithMetadata(assetLinkMarkDef.asset, child.text),

};

}

```

**Rationale (before):** The condition assumed `assetLinkMarkDef.asset` was an object whenever the `asset` key existed.

**Gap:** Same GROQ shape as `mapLink`: `linkType: 'asset'` and `asset: null`. `'assetType' in assetLinkMarkDef.asset` then throws. Footer copyright and other newly mapped fields would hit this on incomplete CMS data.

## After

```ts

if (

assetLinkMarkDef &&

'asset' in assetLinkMarkDef &&

assetLinkMarkDef.asset &&

'assetType' in assetLinkMarkDef.asset

) {

return {

...child,

text: getAssetLabelWithMetadata(assetLinkMarkDef.asset, child.text),

};

}

```


| Check | Meaning |
| --- | --- |
| `assetLinkMarkDef` | This span is marked with an asset link |
| `'asset' in assetLinkMarkDef` | Mark has an `asset` property |
| `assetLinkMarkDef.asset` | Payload is not `null` |
| `'assetType' in assetLinkMarkDef.asset` | Resolved image or file |

If any check fails, the child text is left unchanged (no suffix). Complete asset links still get `(EXT, size)` immediately after the linked text.

**Rationale (after):** Format/size must only be appended when extension and size exist. A null `asset` is not a display bug to paper over with `'in'`; it is missing data. Skipping the suffix avoids a site-wide crash and matches `mapLink` returning `undefined`.
## Impact on other components

`mapRichText` is already used by accordion, highlight banners, text & image, image set captions, card-grid intro, media-download intro, opening-hours extra text, and now footer copyright (and content-page download-modal description). Valid asset links are unchanged. Incomplete ones no longer throw.
## Where it is used

**Definition:** `apps/web/src/utils/prop-mappers/map-rich-text.ts`, exports `mapRichText`.

Callers include `map-footer.ts` (`copyright`), `ContentPage.tsx` (download modal `description`), `map-accordion-group.ts`, `map-highlight-banner-*.ts`, `map-text-image.ts`, `map-text-image-cta.ts`, `map-image-set.ts`, `map-card-grid.ts`, `map-media-download-grid.ts`, `map-opening-hours.ts`.