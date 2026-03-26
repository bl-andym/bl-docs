**File:** apps/studio/src/schema/documents/components/media-download-grid.ts  
**Block:** `items[]`  
**Feature:** WFP1-527 asset file type and size display

------------------------------------------------------------------------
# What changed

The `items` field is defined as an **array**.
In Sanity schemas, the `of` property defines **the structure of each
element inside that array**.

``` ts
defineField({
  name: 'items',
  title: 'Items',
  type: 'array',
  of: [...]
})
```

So `of` determines what each `items[]` entry looks like.

------------------------------------------------------------------------

# Before

`items` was an array whose entries were effectively **just the asset**
(a single field).
Each item therefore only contained the **asset link**, with no
additional fields.

``` ts
defineField({
  name: 'items',
  title: 'Items',
  type: 'array',
  of: [
    assetField({
      isRequired: true,
      description: 'Link to either a file or image. Clear file reference or image to the asset type.',
    }),
  ],
})
```

### Resulting structure

    items
     ├─ asset
     ├─ asset
     └─ asset

Editors could only select an **asset link** for each item.

------------------------------------------------------------------------

# After

Each array entry is now an **object with two fields**:

-   the **asset link field**
-   an optional **`surtitle`** string

``` ts
defineField({
  name: 'items',
  title: 'Items',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        assetField({
          isRequired: true,
          description: 'Link to either a file or image. Clear file reference or image to the asset type.',
        }),
        defineField({
          name: 'surtitle',
          title: 'Surtitle',
          type: 'string',
          description: 'Optional surtitle to display above the title',
          validation: Rule => Rule.max(LABEL_MAX_LENGTH),
          components: {
            input: CreateCharacterCountTextInput(LABEL_MAX_LENGTH),
          },
        }),
      ],
    },
  ],
})
```

### Resulting structure

    items
     ├─ { asset, surtitle }
     ├─ { asset, surtitle }
     └─ { asset, surtitle }

Each item now supports **multiple fields within the same row**.

------------------------------------------------------------------------

## Why the "after" state is correct

### Matches how the frontend uses `items`

In `map-media-download-grid.ts`, the mapper derives:

-   **title** → from `item.asset` as `finalTitle`. The mapper first
    creates a base title using
    `getAssetTitleWithCreditLine(item.asset)`. If asset metadata is
    available, this base title is then enhanced using
    `getAssetLabelWithMetadata(item.asset, baseTitle)` (for example
    adding file type and size).
-   **surtitle** → taken from `item.surtitle`, and shown only when the
    value is a non-empty string.

``` ts
surtitle:
  'surtitle' in item &&
  typeof item.surtitle === 'string' &&
  item.surtitle.trim().length > 0
    ? item.surtitle
    : undefined
```

This means the UI expects each item to **optionally provide a
`surtitle`**, which is rendered **above the title**.\
The schema must therefore allow this field.

------------------------------------------------------------------------

## One object per grid item

To store both **asset** and **surtitle** in the same item, each array
entry must be an object with multiple fields.

Correct structure:

``` ts
of: [
  {
    type: 'object',
    fields: [
      assetField(...),
      surtitle
    ]
  }
]
```

This ensures:

-   **one object per grid item**
-   **two fields within that object** (asset + optional surtitle)

------------------------------------------------------------------------

## Role of `surtitle` in WFP1-527

File **type and size** are handled automatically in the **title**, for
example:

    Report (PDF, 1.2 MB)

The **surtitle** is an **editor-defined line displayed above the
title**, for example:

    Annual reports
    Report (PDF, 1.2 MB)

This allows the component to support:

-   automatic **file metadata in the title**
-   optional **editorial context via the surtitle**

------------------------------------------------------------------------

## Validation and UX

`surtitle` uses the same:

-   `LABEL_MAX_LENGTH`
-   character-count input component

as other label fields in the CMS, keeping behaviour **consistent and
bounded**.

------------------------------------------------------------------------

# Summary

The **media download grid** item is no longer just an asset.\
Each item is now an object containing:

-   the **asset**
-   an optional **surtitle**

This aligns the schema with the **frontend mapper** and supports both:

-   **file type and size display**
-   optional **editorial surtitle provided in the CMS**
