# Domain-Based Icon Suppression: Journey Comparison (blogs.bl.uk vs google.co.uk)

This document traces how two external links are processed and compares where their paths diverge: one to `https://blogs.bl.uk/...` (icon suppressed) and one to `https://www.google.co.uk/...` (icon shown).

**Note:** The CMS `linkType` remains `'external'` for both. This feature suppresses the ↗ icon only; it does not reclassify links in the data model.

---
## 1. Author adds an external link


| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Editor adds link `https://blogs.bl.uk/some-post`. Stored with `linkType: 'external'`, `href: 'https://blogs.bl.uk/some-post'`. | Editor adds link `https://www.google.co.uk/search?q=example`. Stored with `linkType: 'external'`, `href: 'https://www.google.co.uk/search?q=example'`. |

Both are external links; only the host differs.

---
## 2. Page load and mapping

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Mapper calls `mapLink(link)`. Returns `{ href: 'https://blogs.bl.uk/some-post', linkType: 'external', ... }`. Mapped link stored (e.g. `mappedLink`) and used for link + icon. | Mapper calls `mapLink(link)`. Returns `{ href: 'https://www.google.co.uk/search?q=example', linkType: 'external', ... }`. Mapped link stored (e.g. `mappedLink`) and used for link + icon. |

Same flow; only the `href` value differs. Rich text blocks merge the mapped link into mark defs via `mapRichText`.

---
## 3. Call site passes href into icon helper

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| **apps/web:** `getLinkIcon('external', 'https://blogs.bl.uk/some-post')` · **design-system:** `getExternalLinkIcon('external', 'https://blogs.bl.uk/some-post')` | **apps/web:** `getLinkIcon('external', 'https://www.google.co.uk/search?q=example')` · **design-system:** `getExternalLinkIcon('external', 'https://www.google.co.uk/search?q=example')` |

Same pattern; second argument is the respective mapped URL. Which helper runs depends on the component (prop mapper vs RichText / IllustrationCard / BipcButton).

---
## 4. getLinkIcon or getExternalLinkIcon

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Evaluates `href && isBLUkDomain(href) ? undefined : 'externalLink'`. Calls `isBLUkDomain('https://blogs.bl.uk/some-post')`. | Evaluates `href && isBLUkDomain(href) ? undefined : 'externalLink'`. Calls `isBLUkDomain('https://www.google.co.uk/search?q=example')`. |

- **getLinkIcon** — `apps/web/src/utils/prop-mappers/map-link.ts` (prop mappers)
- **getExternalLinkIcon** — `packages/design-system/src/utils/get-external-link-icon.ts` (RichText, IllustrationCard, BipcButton)

Same expression in both helpers; result depends on `isBLUkDomain`.

---
## 5. isBLUkDomain
Path to function `@bl-web/common`

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| `new URL(href).hostname` → `'blogs.bl.uk'`. Check: `host === 'bl.uk'` false; `host.endsWith('.bl.uk')` **true**. Returns **true**. | `new URL(href).hostname` → `'www.google.co.uk'`. Check: `host === 'bl.uk'` false; `host.endsWith('.bl.uk')` **false**. Returns **false**. |

Defined in `packages/common/src/utils/is-bl-uk-domain.ts` (Round 2 — moved out of `link-utils.ts`).

**Comparison:** Only here do the paths diverge. Host `bl.uk` or ending in `.bl.uk` → true; any other host → false.

---
## 6. Back in the icon helper

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| `href && isBLUkDomain(href)` is true. Returns **undefined**. | `href && isBLUkDomain(href)` is false. Returns **'externalLink'**. |

**Comparison:** Same function, different return: `undefined` (no icon) vs `'externalLink'` (show ↗).

---

## 7. Prop to the component

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Prop-mapped components: `linkIcon: undefined` or `icon: undefined`. RichText: `getExternalLinkIcon` returns falsy — no `<Icon name="externalLink" />`. | Prop-mapped components: `linkIcon: 'externalLink'` or `icon: 'externalLink'`. RichText: renders ↗ inline. |

**Comparison:** Different prop / render path drives different UI: no icon vs icon.

---
## 8. Result

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| User sees link to `https://blogs.bl.uk/...` **with no external-link icon** (suppression applied). | User sees link to `https://www.google.co.uk/...` **with the external-link icon** (suppression not applied). |

Both remain `linkType: 'external'` in the CMS.

---
## Summary

- **Same path:** CMS → `mapLink` → call site passes mapped `href` → `getLinkIcon` or `getExternalLinkIcon` → `isBLUkDomain`.
- **Single branch point:** `isBLUkDomain(href)` — host is `bl.uk` or ends with `.bl.uk` vs anything else.
- **Outcome:** `bl.uk` / `*.bl.uk` → no icon; all other external links → ↗ icon.

---
## Architecture summary (Round 2)

```
Two external links (same linkType: 'external', different href)
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
blogs.bl.uk → true → undefined (no ↗)
google.co.uk → false → 'externalLink' (↗)
```