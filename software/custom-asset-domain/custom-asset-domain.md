### `customAssetsDomain` by environment

Only **production** sets `customAssetsDomain` (to `https://www.bl.uk`).

Dev, NLE (staging), and local environments do **not** set it, so the code falls back to `baseUrl` when constructing asset URLs.

Examples of `baseUrl` in non-production environments:

* Azure Front Door URLs (e.g. `...azurefd.net`)
* `http://localhost:3000`

This ensures non-production environments **do not use the live BL domain**. Dev and staging stay on their own hostnames and avoid mixing with production branding or routing.

If more readable asset URLs were needed on staging **without using the BL domain**, `customAssetsDomain` could instead be set to:

`https://cdn.sanity.io`

In that case:

* File links would use the **Sanity CDN domain**
* The **filename would appear in the URL**
* URLs would no longer depend on the application's `baseUrl` for asset paths

### customAssetsDomain — usage by file (with snippets)

| File             | Use                                                | Snippet                                                                                    | Rationale                                                                                    |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| config/config.ts | Set custom asset domain in production config       | `customAssetsDomain: 'https://www.bl.uk',`                                                 | Production uses branded asset URLs (`www.bl.uk`). Other environments fall back to `baseUrl`. |
| config/types.ts  | Optional config field defining custom asset domain | `customAssetsDomain?: string;`                                                             | Allows configuration to override the default asset base URL.                                 |
| sanity/image.ts  | Image URL builder uses optional custom domain      | `baseUrl: clientConfig.customAssetsDomain ?? undefined,`                                   | Images resolve to the custom domain in production.                                           |
| sanity/image.ts  | File/PDF URL builder uses custom domain if present | `baseUrl: serverConfig.customAssetsDomain ?? serverConfig.baseUrl,`                        | Download links include the branded domain and filename.                                      |
| layout.tsx       | Preconnect to asset origin for performance         | `<link rel="preconnect" href={serverConfig.customAssetsDomain ?? serverConfig.baseUrl} />` | Preconnect reduces latency for the first asset request.                                      |

### Why dev/staging config doesn’t set `customAssetsDomain` to the BL domain

#### Different host

Dev and staging use Azure Front Door URLs (e.g. `...azurefd.net`), not `www.bl.uk`.
Only production is served on the BL domain, so only production config sets:

`customAssetsDomain: 'https://www.bl.uk'`

Non-production environments aren’t hosted on the BL domain, so asset URLs are not forced to use it.

#### Avoid tying non-prod to production

If dev or staging set `customAssetsDomain` to `https://www.bl.uk`, asset links would point to the live BL domain.

This would mix dev/staging applications with production URLs, which is undesirable for:

* testing
* caching
* analytics
* avoiding accidental use of production CDN or datasets

#### Branded URLs are a production concern

`customAssetsDomain` is intended for branded, user-facing asset URLs such as:

`www.bl.uk/files/...`

In dev and staging the goal is verifying behaviour and correctness rather than presenting the BL domain, so there is no need to set it.

#### Explicit choice, not oversight

The configuration intentionally sets `customAssetsDomain` **only in production**.

This ensures:

* BL domain and filename appear in links only when the app is actually served as `www.bl.uk`
* Dev and staging environments use environment-appropriate asset URLs (e.g. `baseUrl` or `cdn.sanity.io`).
