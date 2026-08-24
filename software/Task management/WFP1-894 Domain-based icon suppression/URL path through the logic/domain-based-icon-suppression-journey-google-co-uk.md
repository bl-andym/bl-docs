# Journey of a https://www.google.co.uk URL Through Domain-Based Icon Suppression

This document traces how an external link to `https://www.google.co.uk/...` is processed so that it **does** show the external link icon (suppression does not apply).

**Note:** The CMS `linkType` remains `'external'`. For non-BL domains, the ↗ icon is shown as expected.

---

## 1. Author adds an external link

In the CMS, an editor adds an external link with URL `https://www.google.co.uk/search?q=example`. The link is stored with `linkType: 'external'` and `href: 'https://www.google.co.uk/search?q=example'`.

---
## 2. Page load and mapping

When the page is built or loaded, the relevant block (e.g. button banner, list card grid, hub hero banner, card grid) is mapped. The mapper calls `mapLink(link)`, which for external links returns `{ href: link.href, linkType: 'external', openInNewTab: ... }`. So the resolved link is still `https://www.google.co.uk/search?q=example`.

That mapped link is stored in a local variable (e.g. `mappedLink`, `mapped.link`) and used for both the `link` property and the icon decision. For card grids, `mapContentCard` delegates to `mapBaseCard`, which holds `mappedLink` in one place.

Rich text blocks follow a related path: `mapRichText` merges the mapped link (`href`, `linkType`, etc.) into each link mark definition before render.

---
## 3. Call site passes href into icon helper

Each call site passes the **mapped** link's `href` into an icon helper.

**apps/web prop mappers** call `getLinkIcon` in `map-link.ts`:

```ts
getLinkIcon(link?.linkType, mappedLink?.href)

// e.g. getLinkIcon(button.link?.linkType, mapped?.link?.href)
```

**design-system components** call `getExternalLinkIcon` in `get-external-link-icon.ts` (Round 2):

```ts
getExternalLinkIcon(linkValue.linkType, linkValue.href)
```

For this example, the second argument is `'https://www.google.co.uk/search?q=example'`.

---
## 4. getLinkIcon or getExternalLinkIcon

### getLinkIcon
Path to function: `apps/web/src/utils/prop-mappers/map-link.ts`

Called with `linkType === 'external'` and `href === 'https://www.google.co.uk/search?q=example'`. In the `'external'` branch:

```ts
return href && isBLUkDomain(href) ? undefined : 'externalLink';
```

So it calls `isBLUkDomain('https://www.google.co.uk/search?q=example')`.
### getExternalLinkIcon (`packages/design-system/src/utils/get-external-link-icon.ts`)

Used by `RichText`, `IllustrationCard`, and `BipcButton`. When `linkType === 'external'`, it applies the same ternary via `isBLUkDomain(href)`.

---
## 5. isBLUkDomain 
Path to function: `@bl-web/common`

Round 2 moved the domain check out of `link-utils.ts` into:

`packages/common/src/utils/is-bl-uk-domain.ts`

```ts

export const isBLUkDomain = (href: string): boolean => {

try {

const host = new URL(href).hostname;

return host === 'bl.uk' || host.endsWith('.bl.uk');

} catch {

return false;

}

};

```

For `'https://www.google.co.uk/search?q=example'`:
- `hostname` → `'www.google.co.uk'`
- `host === 'bl.uk'` → false
- `'www.google.co.uk'.endsWith('.bl.uk')` → **false** (ends with `.co.uk`, not `.bl.uk`)
- `isBLUkDomain` returns **false**

Both `getLinkIcon` and `getExternalLinkIcon` import `isBLUkDomain` from `@bl-web/common/utils/is-bl-uk-domain`.

---
## 6. Final icon decision

`isBLUkDomain` returned **false**, so the ternary resolves to `'externalLink'` rather than `undefined`.

Both helpers therefore return `'externalLink'` for this URL — whether the call is `getLinkIcon('external', 'https://www.google.co.uk/search?q=example')` or the equivalent `getExternalLinkIcon` call.

---
## 7. Prop to the component

**Prop-mapped components** (e.g. `ContentCard`, `Button`, `ListCard`) receive `linkIcon: 'externalLink'` or `icon: 'externalLink'`. The component renders ↗ when that value is truthy.

**RichText** checks `getExternalLinkIcon(...)` inline and renders `<Icon name="externalLink" />` when the helper returns `'externalLink'`.

---
## 8. Result

The user sees a link to `https://www.google.co.uk/...` **with the external-link icon**, because the hostname does not equal `bl.uk` and does not end with `.bl.uk` — suppression does not apply.

The link remains `linkType: 'external'` in the CMS; the ↗ icon is shown as expected for a truly external URL.

---
## Architecture summary (Round 2)
  

```
CMS external link (href: https://www.google.co.uk/...)
↓
mapLink(link) → { href, linkType: 'external', ... }
↓
┌───────────────────────────────────────────────────────┐

│ apps/web mappers design-system components │

│ getLinkIcon(type, href) getExternalLinkIcon(...) │

└───────────────────────────────────────────────────────┘
↓
isBLUkDomain(href) ← @bl-web/common/utils/is-bl-uk-domain
↓
false → 'externalLink' (↗ shown)

```