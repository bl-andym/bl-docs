**File:** apps/web/src/utils/prop-mappers/map-button.ts
**Block:** mapButton
**Feature:** WFP1-894 Domain-based icon suppression

---

## 1. SUMMARY OF CHANGES

The mapButton function was updated so that the mapped link is computed once and its href is passed to getLinkIcon. A local variable mappedLink holds the result of mapLink(button.link). getLinkIcon is now called with two arguments (linkType and mappedLink?.href) so that external links to bl.uk or *.bl.uk do not receive the external link icon. Both return branches use mappedLink for the link property instead of calling mapLink(button.link) again. No imports, types, or function signatures were added or removed.

---

## 2. CHANGE 1: INTRODUCTION OF mappedLink AND SINGLE mapLink INVOCATION

BEFORE:

```ts
export const mapButton = (button: Button | undefined): DsLinkButtonData | undefined => {
  if (!button) {
    return undefined;
  }

  const linkIcon = button.link?.linkType !== 'internal' ? getLinkIcon(button.link?.linkType) : undefined;
  if (button.link?.linkType === 'asset' && 'asset' in button.link && button.label) {
    return {
      label: getAssetLabelWithMetadata(button.link.asset, button.label),
      link: mapLink(button.link),
      icon: linkIcon,
    };
  }

  return {
    label: button.label,
    link: mapLink(button.link),
    icon: linkIcon,
  };
};
```

AFTER:

```ts
export const mapButton = (button: Button | undefined): DsLinkButtonData | undefined => {
  if (!button) {
    return undefined;
  }

  const mappedLink = mapLink(button.link);
  const linkIcon =
    button.link?.linkType !== 'internal' ? getLinkIcon(button.link?.linkType, mappedLink?.href) : undefined;
  if (button.link?.linkType === 'asset' && 'asset' in button.link && button.label) {
    return {
      label: getAssetLabelWithMetadata(button.link.asset, button.label),
      link: mappedLink,
      icon: linkIcon,
    };
  }

  return {
    label: button.label,
    link: mappedLink,
    icon: linkIcon,
  };
};
```

RATIONALE:

getLinkIcon (in map-link.ts) accepts an optional second parameter href. When linkType is 'external', it uses href to decide whether to return undefined (no icon) for bl.uk or *.bl.uk. The caller must supply the resolved link URL; that URL is the mapped link's href, i.e. the return value of mapLink(button.link). By computing mapLink(button.link) once and storing it in mappedLink, we can pass mappedLink?.href to getLinkIcon and reuse mappedLink as the link value in both return branches. This avoids calling mapLink twice and ensures the icon decision uses the same href that the user will navigate to.

CLASSIFICATION: Refactor (enables passing href); New feature (domain-based icon suppression for external links).

NEW VARIABLE:

  mappedLink. Type: DsLinkData | undefined (inferred from mapLink return type). Holds the result of mapLink(button.link). Used as the link property in both return objects and as the source of href for getLinkIcon.

---

## 3. CHANGE 2: getLinkIcon CALL NOW RECEIVES SECOND ARGUMENT

BEFORE:

```ts
  const linkIcon = button.link?.linkType !== 'internal' ? getLinkIcon(button.link?.linkType) : undefined;
```

AFTER:

```ts
  const linkIcon =
    button.link?.linkType !== 'internal' ? getLinkIcon(button.link?.linkType, mappedLink?.href) : undefined;
```

RATIONALE:

When the button link is external, getLinkIcon needs the resolved href to test against isBlUkDomain. Passing mappedLink?.href supplies that value. When the link is internal or asset, the second argument is ignored by getLinkIcon. When mappedLink is undefined (e.g. mapLink returned undefined), href is undefined and getLinkIcon behaves as before for external (returns 'externalLink').

CLASSIFICATION: New feature.

---

## 4. CHANGE 3: RETURN BRANCHES USE mappedLink INSTEAD OF mapLink(button.link)

BEFORE (asset branch):

```ts
      link: mapLink(button.link),
```

AFTER (asset branch):

```ts
      link: mappedLink,
```

BEFORE (default return):

```ts
    link: mapLink(button.link),
```

AFTER (default return):

```ts
    link: mappedLink,
```

RATIONALE:

The mapped link is already computed and stored in mappedLink. Using mappedLink in both return objects removes the duplicate mapLink(button.link) calls and guarantees the returned link is the same object used to derive href for getLinkIcon. Behaviour and return shape are unchanged.

CLASSIFICATION: Refactor. Performance improvement (one fewer mapLink call per invocation when the asset branch is taken).

---

## 5. IMPORTS, TYPES, AND DEPENDENCIES

No new imports were added. No new types were introduced. The file still imports DsLinkButtonData, getAssetLabelWithMetadata, Link, getLinkIcon, and mapLink. The only new symbol is the local variable mappedLink inside mapButton. No package or dependency changes.

---

## 6. BEHAVIOURAL IMPACT

Before: Every external link on a button showed the external link icon.

After: External links whose resolved href has host bl.uk or *.bl.uk result in no link icon (getLinkIcon returns undefined). All other external links still show the external link icon. Internal and asset link behaviour is unchanged. The returned link object is unchanged in shape; only the icon value for external bl.uk links can now be undefined instead of 'externalLink'.

---

## 7. RISK AND SIDE EFFECTS

Low risk. mapLink is invoked once per mapButton call instead of up to twice. Optional chaining (mappedLink?.href) safely handles undefined mappedLink. If getLinkIcon does not accept a second parameter, the extra argument is ignored and behaviour reverts to always showing the external icon for external links. No changes to callers of mapButton.
