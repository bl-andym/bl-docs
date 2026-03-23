# Formal Change Documentation: map-link.ts

**File:** `apps/web/src/utils/prop-mappers/map-link.ts`

---

## 1. SUMMARY OF CHANGES

The module was updated to support domain-based suppression of the external link icon for links targeting bl.uk or *.bl.uk. An import of isBlUkDomain from link-utils was added. The getLinkIcon function was extended with an optional second parameter (href). For external links, getLinkIcon now returns undefined when the href is a bl.uk domain and returns 'externalLink' otherwise. The mapLink function and the Link type were not modified.

---

## 2. CHANGE 1: NEW IMPORT

BEFORE:

```ts
import type { DsLinkData, LinkIconName } from '@bl-web/design-system/types';

import type { AssetLinkFragment } from '@/api/shared/fragments/link-fragments';
import { createDownloadurl } from '@/sanity/file';
```

AFTER:

```ts
import type { DsLinkData, LinkIconName } from '@bl-web/design-system/types';

import type { AssetLinkFragment } from '@/api/shared/fragments/link-fragments';
import { createDownloadurl } from '@/sanity/file';

import { isBlUkDomain } from '@/utils/link-utils';
```

RATIONALE:

getLinkIcon must determine whether an external link's href targets a bl.uk or *.bl.uk host. That logic lives in isBlUkDomain in link-utils. Importing isBlUkDomain here allows getLinkIcon to call it when evaluating the optional href argument for external links.

CLASSIFICATION: New feature (enables domain-based icon decision).

NEW IMPORT:

  isBlUkDomain from @/utils/link-utils. No new types or dependencies beyond the existing link-utils module.

---

## 3. CHANGE 2: getLinkIcon SIGNATURE

BEFORE:

```ts
export const getLinkIcon = (linkType?: 'external' | 'internal' | 'asset'): LinkIconName | undefined => {
```

AFTER:

```ts
export const getLinkIcon = (linkType?: 'external' | 'internal' | 'asset', href?: string): LinkIconName | undefined => {
```

RATIONALE:

Callers that have the resolved link URL (e.g. mapped href) must be able to pass it so getLinkIcon can distinguish bl.uk from non-bl.uk external links. The second parameter is optional so existing call sites that do not pass href continue to work; in that case external links still receive 'externalLink'.

CLASSIFICATION: New feature. Type safety is unchanged; the new parameter is optional.

NEW PARAMETER:

  href (optional string). The resolved URL of the link. Used only when linkType is 'external'.

---

## 4. CHANGE 3: EXTERNAL LINK BRANCH LOGIC

BEFORE:

```ts
  switch (linkType) {
    case 'external':
      return 'externalLink';
    case 'asset':
```

AFTER:

```ts
  switch (linkType) {
    case 'external':
      return href && isBlUkDomain(href) ? undefined : 'externalLink';
    case 'asset':
```

RATIONALE:

External links to bl.uk or *.bl.uk should not display the external link icon. When href is provided and isBlUkDomain(href) is true, the function returns undefined (no icon). When href is missing or isBlUkDomain(href) is false, the function returns 'externalLink'. Thus only external links with a non-bl.uk href show the icon. Internal and asset branches are unchanged.

CLASSIFICATION: New feature.

BEHAVIOUR:

  If linkType is 'external' and href is truthy and isBlUkDomain(href) returns true: return undefined. Otherwise if linkType is 'external': return 'externalLink'. The conditions are evaluated in that order; isBlUkDomain is not called when href is falsy.

---

## 5. IMPORTS, TYPES, AND DEPENDENCIES

New import: isBlUkDomain from @/utils/link-utils. No new types were added to this file. The Link type and DsLinkData, LinkIconName, AssetLinkFragment, and createDownloadurl are unchanged. No package.json or other dependency changes are introduced; link-utils is an existing module in the same application.

---

## 6. CALL SITE IMPACT

Call sites that already pass only linkType (e.g. getLinkIcon(link?.linkType)) are unchanged; the second argument is undefined, so the external branch returns 'externalLink' for all external links. Call sites that pass the resolved href (e.g. getLinkIcon(link?.linkType, mappedLink?.href)) enable the new behaviour: external links to bl.uk or *.bl.uk receive undefined and all other external links receive 'externalLink'. Call sites for internal or asset links are unaffected; the href parameter is ignored for those link types.

---

## 7. RISK AND SIDE EFFECTS

Low risk. The change is backward compatible. Existing callers that do not pass href retain previous behaviour. Callers that pass href must pass the resolved URL (e.g. from mapLink output) so the hostname check is meaningful. isBlUkDomain handles invalid URLs by returning false (see link-utils documentation), so getLinkIcon does not throw. No changes to mapLink or to link data structures; only the icon selection for external links is affected.

---

## 8. EDGE CASES

When href is undefined or an empty string, the expression href && isBlUkDomain(href) is falsy, so getLinkIcon returns 'externalLink'. When href is a relative path or invalid URL, isBlUkDomain returns false and getLinkIcon returns 'externalLink'. When href is a full URL with host bl.uk or *.bl.uk, isBlUkDomain returns true and getLinkIcon returns undefined.
