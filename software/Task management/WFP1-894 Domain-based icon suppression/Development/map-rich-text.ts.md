**File:** apps/web/src/utils/prop-mappers/map-rich-text.ts
**Block:** mapRichTextBlockWithLinks (link markDefs merge)
**Feature:** WFP1-894 Domain-based icon suppression

---
## 1. SUMMARY OF CHANGES

**Round 1:** Link mark definitions in rich text blocks were updated to copy `linkType` from `mapLink(link)` onto the mark def. That was insufficient for domain-based icon suppression — design-system `RichText` needs the resolved **`href`** on the mark def for `getExternalLinkIcon(linkType, href)`.

**Round 2 (initial):** The mark def merge was changed to `{ ...markDef, ...mappedLink }` so inline links carried the full mapped link (`href`, `linkType`, etc.). This fixed icon behaviour (e.g. text & image captions with `https://iiif.bl.uk/...`) but introduced a TypeScript error — spreading `mappedLink` widened `linkType` and broke the CMS discriminated union on `markDefs`.

**Round 2 (refinement, current):** Replaced full remerge with a **minimal patch**: keep the CMS mark def, add resolved `href` from `mapLink`, and `openInNewTab` for external links only. Lookup uses `mappedLinksByKey` (`Map` keyed by `_key`) instead of a hybrid `{ ...link, ...mappedLink }` array. Fixes the type error; WFP1-894 icon behaviour unchanged.

No imports or exported function signatures were added or removed. The local `DsLinkDataType` was removed because it was no longer required.

**MarkDefs merge** = updating each entry in a block’s **`markDefs`** array by combining the CMS mark def with data from `mapLink`.

In `map-rich-text.ts`:

1. **`markDefs`** - array of definitions for annotations on text (links, etc.)
2. **Merge** - for each link mark def, produce an updated object:

```ts
{
  ...markDef,           // keep CMS fields (_key, _type, linkType, asset, …)
  href: mapped.href,    // add resolved URL from mapLink
  // + openInNewTab for external
}
```

So **“markDefs merge”** is not merging whole blocks — it’s **enriching each link mark def** so `RichText` gets a resolved **`href`** for the icon check, while keeping the CMS mark shape.

**Round 2 initial:** merge = `{ ...markDef, ...mappedLink }` (full remerge)  
**Current:** merge = patch `href` onto `markDef` (minimal merge)

---
## 2. CHANGE 1 (Round 1): linkType ONLY MERGED ONTO MARK DEF

BEFORE:

```ts
const markDefs = block.markDefs?.map(markDef => {

if (markDef._type === 'link') {

const mappedLink = mappedLinks.find(mappedLink => mappedLink?._key === markDef._key);

if (mappedLink) {

const markDefUnionWithMappedLink = { ...markDef };

if (mappedLink.linkType) {

markDefUnionWithMappedLink.linkType = mappedLink.linkType;

}

return markDefUnionWithMappedLink;

}

}

return markDef;

});

```

Problem: `href` was not passed through to the mark def, so `RichText` could not run `isBLUkDomain(href)` for inline external links.

CLASSIFICATION: Incomplete for WFP1-894 (icon suppression required `href` on mark def).

---
## 3. CHANGE 2 (Round 2 initial): FULL MERGE `{ ...markDef, ...mappedLink }`

AFTER (intermediate — superseded):

```ts
const mappedLinks = linkMarkDefs.map(link => {

const mappedLink = mapLink(link);

if (!mappedLink) return null;

return { ...link, ...mappedLink };

});

// in markDefs loop:

return { ...markDef, ...mappedLink };

```

RATIONALE: Merging the full mapped link ensured `href` reached design-system `RichText` for `getExternalLinkIcon`.

Problem: TypeScript rejected `markDefs` on return — `mappedLink.linkType` is `'internal' | 'external' | 'asset' | undefined`, which does not fit the strict CMS link mark union.

CLASSIFICATION: Bug fix for icon behaviour; introduced type error.

---
## 4. CHANGE 3 (Round 2 refinement — current): PATCH href ON MARK DEF

BEFORE (Round 2 intermediate):

```ts
const mappedLinks = linkMarkDefs.map(link => {

const mappedLink = mapLink(link);

if (!mappedLink) return null;

return { ...link, ...mappedLink };

});

  
const markDefs = block.markDefs?.map(markDef => {

if (markDef._type === 'link') {

const mappedLink = mappedLinks.find(mappedLink => mappedLink?._key === markDef._key);

if (mappedLink) {

return { ...markDef, ...mappedLink };

}

}

return markDef;

});

```

  

AFTER (current):

```ts

const mappedLinksByKey = new Map(

linkMarkDefs.flatMap(link => {

const mapped = mapLink(link);

return mapped ? ([[link._key, mapped] as const] as const) : [];

}),

);

  

const markDefs = block.markDefs?.map(markDef => {

if (markDef._type === 'link') {

const mapped = mappedLinksByKey.get(markDef._key);

if (mapped) {

return {

...markDef,

href: mapped.href,

...(markDef.linkType === 'external' ? { openInNewTab: mapped.openInNewTab } : {}),

};

}

}

return markDef;

});

```

  

RATIONALE:

**mark** = annotation/reference on text → `markDef` = definition of that annotation.

**Mark def** = link annotation definition in `markDefs` (not the visible text span). 

Portable Text link **mark defs** are a strict CMS union discriminated by `linkType` (**“discriminated by `linkType`”** means TypeScript uses the value of `linkType` to determine **which member/type of the union the object is**.). 

Mental note: **`linkType` is the identifying field that tells TypeScript which union type applies.**

Design-system `RichText` only needs the resolved **`href`** (and `openInNewTab` for external links) on the mark def to call `getExternalLinkIcon(linkType, href)`. Patching those fields preserves the CMS shape and satisfies TypeScript; full spread of `mappedLink` overwrote `linkType` with a wide type.

“patching” means selectively adding or updating only the specific properties needed, while leaving the rest of the existing `markDef` unchanged.

`href` is resolved by `mapLink(link)` in `const mapped = mapLink(link);`
`mapLink()` converts the CMS link data into application-ready link data containing the resolved `mapped.href`. `map-rich-text.ts` then patches that value onto the `markDef` via `href: mapped.href`.

```ts
// Previously
return {
  ...markDef,
  ...mappedLink, // included linkType and replaced markDef.linkType
};

// Updated
return {
  ...markDef,
  href: mapped.href, // selectively patch resolved href
  ...(markDef.linkType === 'external'
    ? { openInNewTab: mapped.openInNewTab }
    : {}), // conditionally patch openInNewTab for external links only
};
```

CLASSIFICATION: Refactor / type fix (Round 2 refinement). No change to WFP1-894 icon outcome.

NEW SYMBOL (named identifier):

`mappedLinksByKey`: a `Map` keyed by the mark `_key`, containing successful `mapLink` results.

```ts
const mappedLinksByKey = new Map(

linkMarkDefs.flatMap(link => {

const mapped = mapLink(link);

// condition ? ([ [<key>, <value>] const assertion ] const assertion) : empty array
return mapped ? ([[link._key, mapped] as const] as const) : [];

}),

);
```
Mental note: **`new Map()` = create a key → value lookup collection.**

**“Keyed by”** means the `_key` is used as the **identifier for storing and retrieving each value**.
```
// Keyed by conceptually
_key       → mapped result
"abc123"   → mappedLink
"xyz456"   → mappedLink
```
So:
```ts
// retrieves the mapped link stored under `_key: 'abc123'`.
mappedLinksByKey.get('abc123')
```
Mental note: **keyed by `_key` = `_key` is the lookup identifier.**

REMOVED:

`DsLinkDataType` local type (no longer needed). Hybrid `mappedLinks` array with `{ ...link, ...mappedLink }`.

---
## 5. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added to this file. Still imports `mapLink` from `./map-link` only.

Domain-based icon suppression is applied **indirectly**: this file puts resolved `href` on mark defs; design-system `RichText` calls `getExternalLinkIcon` → `isBLUkDomain` in `@bl-web/common`. This file does not import `@bl-web/common` or `getExternalLinkIcon`.

No package or dependency changes in this file.

---
## 6. BEHAVIOURAL IMPACT

**Scope:** Any block mapped through `mapRichText` that contains inline link mark defs — including text & image body/caption, accordions, card grid intro text, media download intro, opening hours, etc. Blocks with no link marks are unchanged.

**Before Round 2:** Inline external links in rich text always showed ↗ (RichText checked `linkType === 'external'` only; mark def often lacked resolved `href` for domain check).

**After (current):** Mark defs carry resolved `href`. `RichText` suppresses ↗ for external links whose `href` is `bl.uk` or ends with `.bl.uk`. Internal and asset inline link behaviour unchanged aside from resolved `href` on asset download links.

**Round 2 refinement vs full merge:** No intended change to icon behaviour; refinement fixes TypeScript and avoids overwriting `linkType` on mark defs.

---
## 7. RISK AND SIDE EFFECTS

Low risk. `mapLink` is invoked once per link mark in `linkMarkDefs`. Optional chaining is not required on Map lookup — undefined `mapped` skips the patch. Mark defs without a successful `mapLink` are returned unchanged.

External links: `href` and `openInNewTab` patched from `mapLink`. Internal/asset: only `href` patched; CMS `linkType` and asset fields preserved.

No changes to `mapRichText` signature or to callers.

```ts
// Mark def patch (external link example)

return {

...markDef,

href: mapped.href,

...(markDef.linkType === 'external' ? { openInNewTab: mapped.openInNewTab } : {}),

};

```

---
## 8. ROUND SUMMARY

| Round | Change |
|-------|--------|
| Round 1 | Copy `linkType` from `mapLink` onto mark def only |
| Round 2 (initial) | Full merge `{ ...markDef, ...mappedLink }` — icons fixed, TS error |
| Round 2 (refinement) | Patch `href` (+ `openInNewTab` for external); `mappedLinksByKey` Map — TS fixed, icons unchanged |

---
## 9. DOWNSTREAM CONSUMER

Design-system `RichText/index.tsx` (Round 2):

```ts
getExternalLinkIcon(linkValue.linkType, linkValue.href)
```

Requires `href` on the mark def — supplied by this mapper.