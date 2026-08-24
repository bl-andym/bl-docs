# Journey of a blogs.bl.uk URL Through Domain-Based Icon Suppression

This document traces how an external link to `https://blogs.bl.uk/...` is processed so that it does not show the external link icon.

**Note:** The CMS `linkType` remains `'external'`. This feature suppresses the ↗ icon only; it does not reclassify the link in the data model.

---
## 1. Author adds an external link

In the CMS, an editor adds an external link with URL `https://blogs.bl.uk/some-post`. The link is stored with `linkType: 'external'` and `href: 'https://blogs.bl.uk/some-post'`.

---
## 2. Page load and mapping

When the page is built or loaded, the relevant block (e.g. button banner, list card grid, hub hero banner, card grid) is mapped. The mapper calls `mapLink(link)`, which for external links returns `{ href: link.href, linkType: 'external', openInNewTab: ... }`. So the resolved link is still `https://blogs.bl.uk/some-post`.

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

Both helpers use the same domain rule. For this example, the second argument is `'https://blogs.bl.uk/some-post'`.

---
## 4. getLinkIcon or getExternalLinkIcon

### getLinkIcon 
Path to function: `apps/web/src/utils/prop-mappers/map-link.ts`

Called with `linkType === 'external'` and `href === 'https://blogs.bl.uk/some-post'`. In the `'external'` branch:

```ts
return href && isBLUkDomain(href) ? undefined : 'externalLink';
```

So it calls `isBLUkDomain('https://blogs.bl.uk/some-post')`.
### getExternalLinkIcon 
Path to function: `packages/design-system/src/utils/get-external-link-icon.ts`

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

For `'https://blogs.bl.uk/some-post'`:
- `hostname` → `'blogs.bl.uk'`
- `'blogs.bl.uk'.endsWith('.bl.uk')` → **true**
- `isBLUkDomain` returns **true**
  
Both `getLinkIcon` and `getExternalLinkIcon` import `isBLUkDomain` from `@bl-web/common/utils/is-bl-uk-domain`.

---
## 6. Back in the icon helper

Because `href` is truthy and `isBLUkDomain(href)` is true, the ternary yields `undefined`.

So `getLinkIcon('external', 'https://blogs.bl.uk/some-post')` returns `undefined` (and `getExternalLinkIcon` does the same).

---
## 7. Prop to the component

**Prop-mapped components** (e.g. `ContentCard`, `Button`, `ListCard`) receive `linkIcon: undefined` or `icon: undefined`. The component only renders an icon when that value is truthy, so no ↗ is shown.

**RichText** checks `getExternalLinkIcon(...)` inline and only renders `<Icon name="externalLink" />` when the helper returns a truthy icon name.

---
## 8. Result

The user sees a link to `https://blogs.bl.uk/some-post` with no external-link icon, because the hostname ends with `.bl.uk` and the icon was suppressed.

The link still behaves as an external link in the CMS (`linkType: 'external'`); only the ↗ icon is omitted.

---
## Architecture summary (Round 2)

```
CMS external link (href: https://blogs.bl.uk/...)
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
true → undefined (no icon) | false → 'externalLink' (↗)
```