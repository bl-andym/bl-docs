# Domain-Based Icon Suppression: Journey Comparison (blogs.bl.uk vs google.co.uk)

This document traces how two external links are processed and compares where their paths diverge: one to `https://blogs.bl.uk/...` (icon suppressed) and one to `https://www.google.co.uk/...` (icon shown).

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
| Mapper calls `mapLink(link)`. Returns `{ href: 'https://blogs.bl.uk/some-post', linkType: 'external', ... }`. Mapped link stored or used in callback. | Mapper calls `mapLink(link)`. Returns `{ href: 'https://www.google.co.uk/search?q=example', linkType: 'external', ... }`. Mapped link stored or used in callback. |

Same flow; only the `href` value differs.

---

## 3. Call site passes href into getLinkIcon

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Call site passes `getLinkIcon('external', 'https://blogs.bl.uk/some-post')`. | Call site passes `getLinkIcon('external', 'https://www.google.co.uk/search?q=example')`. |

Same pattern; second argument is the respective URL.

---

## 4. getLinkIcon (map-link.ts)

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Evaluates `href && isBlUkDomain(href) ? undefined : 'externalLink'`. Calls `isBlUkDomain('https://blogs.bl.uk/some-post')`. | Evaluates `href && isBlUkDomain(href) ? undefined : 'externalLink'`. Calls `isBlUkDomain('https://www.google.co.uk/search?q=example')`. |

Same expression; result depends on `isBlUkDomain`.

---

## 5. isBlUkDomain (link-utils.ts)

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| `new URL(href).hostname` → `'blogs.bl.uk'`. Check: `host === 'bl.uk'` false; `host.endsWith('.bl.uk')` **true**. Returns **true**. | `new URL(href).hostname` → `'www.google.co.uk'`. Check: `host === 'bl.uk'` false; `host.endsWith('.bl.uk')` **false**. Returns **false**. |

**Comparison:** Only here do the paths differ. bl.uk / *.bl.uk → true; any other host → false.

---

## 6. Back in getLinkIcon

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| `href && isBlUkDomain(href)` is true. Returns **undefined**. | `href && isBlUkDomain(href)` is false. Returns **'externalLink'**. |

**Comparison:** Same function, different return: undefined (no icon) vs 'externalLink' (show icon).

---

## 7. Prop to the component

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| Mapper sets `linkIcon: undefined` (or `icon: undefined`). Component does not render an icon when linkIcon is falsy. | Mapper sets `linkIcon: 'externalLink'` (or `icon: 'externalLink'`). Component renders the external-link icon. |

**Comparison:** Different prop value drives different UI: no icon vs icon.

---

## 8. Result

| blogs.bl.uk | google.co.uk |
|-------------|--------------|
| User sees link to `https://blogs.bl.uk/...` **with no external-link icon** (suppression applied). | User sees link to `https://www.google.co.uk/...` **with the external-link icon** (suppression not applied). |

---

## Summary

- **Same path:** CMS → mapLink → call site passes href → getLinkIcon → isBlUkDomain.
- **Single branch point:** `isBlUkDomain(href)` (host is bl.uk or *.bl.uk vs anything else).
- **Outcome:** bl.uk / *.bl.uk → no icon; all other external links → external link icon.
