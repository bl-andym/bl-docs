**File:** apps/web/src/utils/prop-mappers/map-button-banner.ts
**Block:** mapButtonBanner
**Feature:** WFP1-894 Domain-based icon suppression

---

## 1. Summary of Changes

The buttons mapping inside `mapButtonBanner` was refactored so that the mapped link's `href` is passed to `getLinkIcon`. This allows `getLinkIcon` to decide icon visibility for external links based on the link URL (e.g. suppress external link icon for `*.bl.uk`). No imports, types, or function signatures were added or removed.

---

## 2. Change 1: buttons.map callback from arrow expression to block with local variable

### Before

```ts
buttons.map(button => ({
  ...mapButton(button),
  _id: button._key,
  label: button.label,
  color: button.link.linkType === 'internal' && 'color' in button.link ? button.link.color : undefined,
  icon: getLinkIcon(button.link.linkType),
  _key: button._key,
})),
```

### After

```ts
buttons.map(button => {
  const mapped = mapButton(button);
  return {
    ...mapped,
    _id: button._key,
    label: button.label,
    color: button.link.linkType === 'internal' && 'color' in button.link ? button.link.color : undefined,
    icon: getLinkIcon(button.link.linkType, mapped?.link?.href),
    _key: button._key,
  };
}),
```

### Rationale

The callback was changed from a single expression returning an object to a block body so that `mapButton(button)` can be stored in a variable (`mapped`). That variable is needed to pass the resolved link `href` (`mapped?.link?.href`) into `getLinkIcon`. Without storing the result, the mapped href is not available at the call site.

### Classification

Refactor (enables passing href; no change to external API or types).

---

## 3. Change 2: Introduction of local variable `mapped`

### Before

No local variable; `mapButton(button)` was used only inside the object spread.

### After

```ts
const mapped = mapButton(button);
```

### Rationale

`mapped` holds the return value of `mapButton(button)`, which includes the mapped link (with resolved href). It is used for: (1) spreading into the returned object via `...mapped`, and (2) supplying `mapped?.link?.href` as the second argument to `getLinkIcon`. This avoids calling `mapButton(button)` twice and provides the href required for domain-based icon logic.

### Classification

Refactor.

### New variable

- **mapped:** Holds the return value of `mapButton(button)` (label, link, icon and any other properties returned by mapButton). Type is inferred from mapButton's return type (`DsLinkButtonData | undefined`).

---

## 4. Change 3: getLinkIcon call now receives second argument (href)

### Before

```ts
icon: getLinkIcon(button.link.linkType),
```

### After

```ts
icon: getLinkIcon(button.link.linkType, mapped?.link?.href),
```

### Rationale

`getLinkIcon` (in `map-link.ts`) was extended to accept an optional second parameter, `href`. When `linkType` is `'external'`, it uses `href` to determine whether the link targets a `*.bl.uk` host; if so, it returns `undefined` (no icon) instead of `'externalLink'`. Passing `mapped?.link?.href` supplies the resolved URL for the button's link so that this logic can run. Using the mapped link ensures the href is the final URL (e.g. after any mapping in mapLink), not the raw CMS value. If `mapped` or `mapped.link` is undefined, the second argument is undefined and `getLinkIcon` behaves as before (external links still get `'externalLink'`).

### Classification

New feature (domain-based suppression of external link icon for `*.bl.uk`).

### Dependency

Relies on `getLinkIcon` in `map-link.ts` accepting an optional second parameter (`href?: string`) and on `link-utils` `isBlUkDomain` (or equivalent) for the `*.bl.uk` check. No new imports or dependencies were added in this file.

---

## 5. Imports, types, and dependencies

No new imports were added. No new types were introduced. No new dependencies were added in package.json or elsewhere. The file continues to use: `compact` (array util), `ButtonBannerProps`, `ButtonBanner`, `shiftByN`, `mapButton`, `getLinkIcon`. The only new symbol in this file is the local variable `mapped` inside the map callback.

---

## 6. Behavioural impact

- **Before:** Every external link in a button banner showed the external link icon, regardless of URL.
- **After:** External links whose resolved `href` has a host of `bl.uk` or `*.bl.uk` (e.g. `www.bl.uk`, `blogs.bl.uk`) result in no link icon (`getLinkIcon` returns `undefined`). All other external links still receive the external link icon. Internal and asset link types are unchanged; the second argument is only used when `linkType` is `'external'`.

---

## 7. Risk and side effects

Low risk. `mapButton` is invoked once per button instead of once in the spread; behaviour of `mapButton` and the returned object shape are unchanged. Optional chaining (`mapped?.link?.href`) safely handles undefined `mapped` or missing `link`. If `getLinkIcon` does not expect a second parameter (e.g. in an older version), the extra argument is ignored in JavaScript/TypeScript and behaviour reverts to the previous "always show external icon" for external links.
