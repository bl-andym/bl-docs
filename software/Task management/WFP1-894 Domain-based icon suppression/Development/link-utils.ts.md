**File:** apps/web/src/utils/link-utils.ts
**Block:** isBlUkDomain(href: string)
**Feature:** WFP1-894 Domain-based icon suppression

---

## 1. Summary of Changes

A new exported function `isBlUkDomain(href: string)` was added to link-utils.ts. It parses the given URL string and returns true when the hostname is "bl.uk" or ends with ".bl.uk", and false otherwise. No existing functions were modified. No new imports or types were introduced. Existing exports (filesizeToString, getAssetMetadata, getAssetLabelWithMetadata, getAssetTitleWithCreditLine) are unchanged.

---

## 2. Change 1: Addition of isBlUkDomain function

### Before

No `isBlUkDomain`. File ended after `getAssetTitleWithCreditLine`:

```ts
  return asset.title + creditLine;
};
```

### After

```ts
// Returns true if href's host is bl.uk or *.bl.uk
export const isBlUkDomain = (href: string): boolean => {
  try {
    const host = new URL(href).hostname;
    return host === 'bl.uk' || host.endsWith('.bl.uk');
  } catch {
    return false;
  }
};
```

### Rationale

Callers need a single place to determine whether a link URL belongs to the bl.uk organisation (apex bl.uk or any subdomain *.bl.uk). This is used to decide whether to show the "external link" icon for external links: links to bl.uk or *.bl.uk should not show the icon. Centralising the check in link-utils.ts keeps all link-related helpers in one module and avoids duplicating URL parsing and host logic elsewhere. The try/catch ensures invalid or non-URL strings (e.g. relative paths, malformed URLs) do not throw; they yield false so callers can treat them as non-bl.uk.

### Classification

New feature.

---

## 3. Function signature and behaviour

- **Name:** `isBlUkDomain`
- **Parameters:** `href` (string). The URL or URL-like string to test.
- **Return type:** `boolean`

**Behaviour:**

- Parses `href` via the URL constructor (`new URL(href)`).
- Reads the hostname (e.g. "www.bl.uk", "blogs.bl.uk", "bl.uk").
- Returns `true` if hostname is exactly "bl.uk" or ends with ".bl.uk".
- Returns `false` for any other hostname or if parsing throws (invalid URL, relative path, etc.).

No new variables are exported. The only local variable is `host` inside the function. No new types are introduced; the function uses the built-in URL and string methods. No new dependencies; URL is a global in the runtime.

---

## 4. Imports, types, and dependencies

No new imports were added. The file still imports only: `DsAssetData` from `@bl-web/design-system/types`. That type is used only by the existing asset helpers, not by `isBlUkDomain`. `isBlUkDomain` does not depend on any project-specific types or modules. No package.json or other dependency changes are implied by this file.

---

## 5. Usage and integration

`isBlUkDomain` is intended to be called by code that decides whether to show an external link icon (e.g. `getLinkIcon` in map-link.ts). When linkType is "external", the caller passes the resolved href to `getLinkIcon`; `getLinkIcon` (or a helper it uses) can call `isBlUkDomain(href)` and, when true, return undefined (no icon) instead of "externalLink". This file does not call `isBlUkDomain`; it only defines and exports it.

---

## 6. Edge cases and error handling

Relative URLs (e.g. "/path") or invalid strings passed to `new URL(href)` will throw in most runtimes; the catch block returns false, so `isBlUkDomain` does not throw. Protocol-relative URLs (e.g. "//www.bl.uk") may parse depending on context; if they parse, hostname is read and the same bl.uk / *.bl.uk logic applies. No explicit handling for null or undefined is present; passing a non-string will cause `new URL(href)` or host access to fail and the catch block will return false.

---

## 7. Risk and side effects

Low risk. The change is additive only. Existing callers of link-utils.ts are unaffected. New callers that depend on `isBlUkDomain` must pass a string href; behaviour for non-URL strings is defined as false. No performance impact on existing functions. No security-sensitive logic beyond reading the hostname of a URL; the function does not execute or navigate to the URL.
