# Journey of a https://www.google.co.uk URL Through Domain-Based Icon Suppression

This document traces how an external link to `https://www.google.co.uk/...` is processed so that it does show the external link icon (suppression does not apply).

---

## 1. Author adds an external link

In the CMS, an editor adds an external link with URL `https://www.google.co.uk/search?q=example`. The link is stored with `linkType: 'external'` and `href: 'https://www.google.co.uk/search?q=example'`.

---

## 2. Page load and mapping

When the page is built or loaded, the relevant block (e.g. button banner, list card grid, hub hero banner) is mapped. The mapper calls `mapLink(link)`, which for external links returns `{ href: link.href, linkType: 'external', openInNewTab: ... }`. So the resolved link is still `https://www.google.co.uk/search?q=example`. That mapped link is either stored (e.g. `mappedLink`, `mapped`, `base.link`) or used immediately in the same callback.

---

## 3. Call site passes href into getLinkIcon

Each call site passes the **mapped** link's href into `getLinkIcon`. For example: `getLinkIcon(button.link?.linkType, mapped?.link?.href)` or `getLinkIcon(link?.linkType, mappedLink?.href)`. So for this button or card, the second argument is `'https://www.google.co.uk/search?q=example'`.

---

## 4. getLinkIcon (map-link.ts)

`getLinkIcon` is called with `linkType === 'external'` and `href === 'https://www.google.co.uk/search?q=example'`. In the `'external'` branch it evaluates: `return href && isBlUkDomain(href) ? undefined : 'externalLink'`. So it calls `isBlUkDomain('https://www.google.co.uk/search?q=example')`.

---

## 5. isBlUkDomain (link-utils.ts)

`isBlUkDomain` runs `new URL(href).hostname` inside a try/catch. For `'https://www.google.co.uk/search?q=example'` the hostname is `'www.google.co.uk'`. It then returns `host === 'bl.uk' || host.endsWith('.bl.uk')`. Here `'www.google.co.uk'` is not `'bl.uk'` and does not end with `'.bl.uk'`, so `isBlUkDomain` returns false.

---

## 6. Back in getLinkIcon

Because `isBlUkDomain(href)` is false, the ternary yields `'externalLink'`. So `getLinkIcon('external', 'https://www.google.co.uk/search?q=example')` returns `'externalLink'`.

---

## 7. Prop to the component

The mapper sets `linkIcon: 'externalLink'` (or `icon: 'externalLink'` for buttons) on the props passed to the design-system component (e.g. ContentCard, Button). The component renders the external-link icon when `linkIcon` is truthy and matches the icon name used for external links.

---

## 8. Result

The user sees a link to `https://www.google.co.uk/...` with the external link icon, because the domain is not bl.uk or *.bl.uk and suppression does not apply.
