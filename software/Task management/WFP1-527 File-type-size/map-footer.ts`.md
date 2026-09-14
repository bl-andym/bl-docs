**File:** `apps/web/src/utils/prop-mappers/map-footer.ts`
**Block:** `mapFooter`
**Feature:** WFP1-527 asset file type and size display

## Purpose

Transforms layout **Footer** CMS data (`FooterModel`) into props for the design-system **`Footer`** component (`FooterProps`). Social links, secondary links, and link-list sections were already mapped. This change only affects **copyright**.

## Before

```ts

copyright: footer?.copyright,

```


Copyright was copied through as raw Sanity portable text. The Footer component still rendered it with `RichText`, so links could appear, but they never went through `mapRichText`.

**Rationale (before):** Most footer links are not assets (Studio `excludeFields: ['asset']` on nav, secondary, and social). Copyright was treated as simple copy. That left the one portable-text field that **does** allow asset links outside the shared rich-text path.

**Gap:** An asset link in **Site-wide settings → Footer → Copyright** had no download `href` mapping and did **not** show file format and size immediately after the linked text.

  

## After

```ts

copyright: mapRichText(footer.copyright as RichTextField),

```

| Input field | Output prop | Transformation |
| --- | --- | --- |
| `socialLinks`, `secondaryLinks`, `linkListSections` | Same names | Unchanged (`mapLink` on labelled links; assets excluded in CMS) |
| `copyright` | `copyright` | `mapRichText(...)` — portable text → component-ready rich text, including asset links |

The `as RichTextField` cast is required because the layout GROQ type is not the content-block `RichTextField` alias. The payload shape is the same (portable text with link marks).

No Studio or GROQ change. `richTextFragment` already loads asset metadata on copyright links.

**Rationale (after):** Copyright is Sanity portable text with the shared link annotation (internal / external / **asset**). Routing it through `mapRichText` matches accordion, highlight banners, and text & image: inline links are turned into `DsLink` props (`href`, `linkType`, `openInNewTab`), asset links get a download `href`, and file format and size are appended immediately after the linked text, e.g. `Annual report (PDF, 1.2MB)`. That is the WFP1-527 behaviour for this surface.

## Where it is used

1. **Definition:** `apps/web/src/utils/prop-mappers/map-footer.ts` — exports `mapFooter`.

2. **Consumption:** `apps/web/src/components/shared/Footer/Footer.tsx` — `mapFooter(props.data)` then `<DsFooter {...data} />`.

3. **CMS:** Website → **Site-wide settings** → **Footer** → **Copyright**.

## Data path

Sanity footer singleton → layout GROQ (`copyright[] { richTextFragment }`) → `mapFooter` → design-system `Footer` → `RichText`

The mapper does not call the network; it only shapes data already loaded for the layout.