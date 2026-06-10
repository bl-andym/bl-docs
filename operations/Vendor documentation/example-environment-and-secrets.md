# Environment and secrets

This project keeps **secrets outside the repository**. Configuration is split into two layers: non-sensitive settings that live with the app, and sensitive credentials that live in a separate location on the developer machine or in the deployment platform.

## Concept

The goal is simple: **nothing that can grant access to external systems belongs in git**.

Instead of storing database credentials, API keys, or tokens in the project tree, the app references them indirectly. The repository holds only:

- **Public configuration** — values safe to share or rebuild from documentation (for example, API route paths exposed to the browser).
- **A pointer** — an environment variable that tells server-side code where to load real secrets from at runtime.

Secrets themselves sit in an **external secrets file** (local development) or are **injected by the host environment** (CI, staging, production).

```
┌─────────────────────────────────────┐
│  Project (in git)                   │
│  .env                               │
│    PUBLIC_CONFIG=...                │
│    EXTERNAL_SECRETS_FILE=<path>     │──┐
└─────────────────────────────────────┘  │
                                         │ pointer only
┌─────────────────────────────────────┐  │
│  External secrets (not in git)      │◄─┘
│  DATABASE_CONNECTION_STRING=...     │
│  API_KEY=...                        │
└─────────────────────────────────────┘
```

This pattern scales by changing *how* secrets are delivered, not *whether* they stay out of the repo:

| Environment   | Delivery mechanism                          |
|---------------|---------------------------------------------|
| Local dev     | External file referenced by pointer var     |
| CI / cloud    | Platform environment variables or vault     |
| Enterprise    | Managed secret store with rotation and audit |

## Naming conventions

Use names that describe **role**, not implementation detail:

| Variable                     | Layer   | `NEXT_PUBLIC_`? | Purpose                                               |
|------------------------------|---------|-----------------|-------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`        | Public  | Yes             | API path the browser needs to call (not a credential) |
| `EXTERNAL_SECRETS_FILE`      | Pointer | No              | Absolute or home-relative path to the secrets file    |
| `DATABASE_CONNECTION_STRING` | Secret  | **Never**       | Credential for the primary data store                 |

In this codebase the pointer is `EXTERNAL_ENV_FILE` and the primary secret is `MONGODB_URI`. The names differ slightly from the generic table above, but the roles are the same: one variable points to the file, one holds the credential.

The `NEXT_PUBLIC_` prefix is not decorative naming — it defines a **trust boundary** between server runtime and client bundle. The rules below follow from that boundary.

### Rules

#### 1. Prefix client-visible variables with `NEXT_PUBLIC_`

In Next.js, environment variables are **server-only by default**. Anything without the `NEXT_PUBLIC_` prefix exists only in Node during build and request handling; it is not exposed to the browser bundle.

Adding `NEXT_PUBLIC_` tells Next.js: **this value is safe to embed in client-side JavaScript**. At build time, Next.js replaces `process.env.NEXT_PUBLIC_*` with the literal string in code that ships to the browser.

In this project, `NEXT_PUBLIC_API_URL` is the correct use: the client page needs to know *where* to call the API (for example `/api/data`). That is configuration, not a credential — anyone can see that URL in DevTools once the app runs.

Use `NEXT_PUBLIC_` when:

- A client component or browser code genuinely needs the value
- The value is not sensitive (paths, feature flags, public API base URLs, analytics IDs meant for the client)

Do not use it when:

- Only server code needs the value (database URIs, signing keys, admin tokens)
- You are unsure whether it is secret — default to **no prefix**

#### 2. Never prefix secrets with `NEXT_PUBLIC_`

This is the most important rule, because the prefix is not a hint — it is a **deliberate exposure mechanism**.

If a secret were named `NEXT_PUBLIC_DATABASE_CONNECTION_STRING`, Next.js would **inline that string into the JavaScript sent to every visitor**. Consequences include:

| Risk              | What happens                                                                 |
|-------------------|------------------------------------------------------------------------------|
| Immediate leak    | Anyone opens DevTools and reads the bundled JS                               |
| Permanent leak    | The value is baked into static chunks; crawlers and caches can retain it     |
| Git / CI exposure | Build logs, error reports, or source maps may echo the value                 |
| No take-back      | Rotating the secret does not remove old bundles already deployed or cached   |

There is no private mode for `NEXT_PUBLIC_`. The name means: **public by design**.

That is why this project keeps `MONGODB_URI` in the external secrets file with **no** `NEXT_PUBLIC_` prefix, and loads it only in server-side API routes. The browser never receives it; it only gets JSON from the API after the server has already authenticated to the database.

**Mental model:**

- No prefix → server vault
- `NEXT_PUBLIC_` → printed on a postcard mailed to every user

A common mistake is treating `NEXT_PUBLIC_` as “this env var is for the frontend feature” rather than “this env var is **published to the world**.” Secrets must stay on the server side of that boundary.

#### 3. Keep the project `.env` limited to public config and the secrets file path

The project `.env` should answer: *“How does this app find its configuration?”* — not *“What are the credentials?”*

**Belongs in project `.env`:**

- `NEXT_PUBLIC_*` values (public by definition)
- `EXTERNAL_SECRETS_FILE` (or equivalent) — a **pointer**, not a secret itself

**Belongs in the external secrets file (or deployment platform):**

- Database connection strings
- API keys, tokens, private keys

This keeps two failure modes smaller:

1. **Accidental commit** — if `.env` slips into git, you leak a path, not credentials.
2. **Wrong layer** — developers see clearly where public config ends and secrets begin.

The pointer variable is intentionally low sensitivity: knowing *that* secrets live at `~/secrets/<app-name>/secrets.env` does not grant access unless someone also has filesystem access on that machine. The credential itself remains in the external file with stricter access control.

## Local setup

1. Create a secrets directory outside the project, for example:

   ```
   ~/secrets/<app-name>/secrets.env
   ```

2. Add credentials to that file:

   ```env
   DATABASE_CONNECTION_STRING=mongodb+srv://...
   ```

3. In the project root, create a `.env` file (gitignored) with public config and the pointer:

   ```env
   NEXT_PUBLIC_API_URL=/api/data
   EXTERNAL_SECRETS_FILE=~/secrets/<app-name>/secrets.env
   ```

4. Start the dev server. Server-side code loads the project `.env`, resolves the pointer, then loads the external file before connecting to external services.

## How this project applies the pattern

### Secrets stay out of version control

`.env` and `.env.local` are listed in `.gitignore`. Only non-secret configuration and the path pointer belong in the local project env file.

### Two-step loading on the server

The API route loads configuration in order:

1. Project `.env` — public settings and the secrets file pointer.
2. External file — credentials referenced by the pointer.

If the pointer is set but the file is missing, the app fails immediately with a clear error rather than running without credentials.

### Fail-fast validation

Server code throws if a required secret (for example the database connection string) is undefined after loading. Misconfiguration is caught at startup, not on the first user request in an ambiguous state.

### Server-only access to credentials

Sensitive values are read only in server-side code (`app/api/**`). The client page uses `NEXT_PUBLIC_API_URL` to call the API route; it never receives or embeds database credentials.

### Separation of public and private config

| Concern              | Where it lives              | Consumed by   |
|----------------------|-----------------------------|---------------|
| API endpoint path    | Project `.env`              | Client + server |
| Database credentials | External secrets file       | Server only   |
| File location pointer| Project `.env`              | Server only   |

## Good practices demonstrated

1. **Defence in depth** — gitignore plus physical separation means a mistaken `git add` is less likely to expose credentials.
2. **Least exposure** — secrets never reach the browser bundle or client components.
3. **Explicit configuration** — required variables are validated; missing secrets produce errors, not silent defaults to production systems.
4. **Portable concept** — the same code path accepts secrets from an external file locally or from injected environment variables in deployment (set `DATABASE_CONNECTION_STRING` directly and omit the file pointer).
5. **Documented contract** — this file describes what each layer holds so new contributors know where to put values without hunting through code.

## Deployment note

In hosted environments, skip the external file entirely. Configure `DATABASE_CONNECTION_STRING` (or the project’s equivalent) in the platform’s secret store or environment settings. The pointer variable is a **local-development convenience**, not a production requirement.
