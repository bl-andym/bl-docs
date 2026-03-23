# Journey of a blogs.bl.uk URL Through Domain-Based Icon Suppression

This document traces how an external link to `https://blogs.bl.uk/...` is processed so that it does not show the external link icon.

---

## 1. Author adds an external link

In the CMS, an editor adds an external link with URL `https://blogs.bl.uk/some-post`. The link is stored with `linkType: 'external'` and `href: 'https://blogs.bl.uk/some-post'`.

---

## 2. Page load and mapping

When the page is built or loaded, the relevant block (e.g. button banner, list card grid, hub hero banner) is mapped. The mapper calls `mapLink(link)`, which for external links returns `{ href: link.href, linkType: 'external', openInNewTab: ... }`. So the resolved link is still `https://blogs.bl.uk/some-post`. That mapped link is either stored (e.g. `mappedLink`, `mapped`, `base.link`) or used immediately in the same callback.

---

## 3. Call site passes href into getLinkIcon

Each call site was updated to pass the **mapped** link's href into `getLinkIcon`. For example: `getLinkIcon(button.link?.linkType, mapped?.link?.href)` or `getLinkIcon(link?.linkType, mappedLink?.href)`. So for this button or card, the second argument is `'https://blogs.bl.uk/some-post'`.

---

## 4. getLinkIcon (map-link.ts)

`getLinkIcon` is called with `linkType === 'external'` and `href === 'https://blogs.bl.uk/some-post'`. In the `'external'` branch it evaluates: `return href && isBlUkDomain(href) ? undefined : 'externalLink'`. So it calls `isBlUkDomain('https://blogs.bl.uk/some-post')`.

---

## 5. isBlUkDomain (link-utils.ts)

`isBlUkDomain` runs `new URL(href).hostname` inside a try/catch. For `'https://blogs.bl.uk/some-post'` the hostname is `'blogs.bl.uk'`. It then returns `host === 'bl.uk' || host.endsWith('.bl.uk')`. Here `'blogs.bl.uk'.endsWith('.bl.uk')` is true, so `isBlUkDomain` returns true.

---

## 6. Back in getLinkIcon

Because `href` is truthy and `isBlUkDomain(href)` is true, the ternary yields `undefined`. So `getLinkIcon('external', 'https://blogs.bl.uk/some-post')` returns `undefined`.

---

## 7. Prop to the component

The mapper sets `linkIcon: undefined` (or `icon: undefined` for buttons) on the props passed to the design-system component (e.g. ContentCard, Button). The component only renders an icon when `linkIcon` is truthy, so for this link it renders no icon.

---

## 8. Result

The user sees a link to `https://blogs.bl.uk/some-post` with no external-link icon, because the domain was treated as part of the bl.uk organisation and the icon was suppressed.
