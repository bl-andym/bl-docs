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

| Variable                    | Layer    | Purpose                                              |
|-----------------------------|----------|------------------------------------------------------|
| `EXTERNAL_SECRETS_FILE`     | Pointer  | Absolute or home-relative path to the secrets file   |
| `DATABASE_CONNECTION_STRING`| Secret   | Credential for the primary data store                |
| `NEXT_PUBLIC_*`             | Public   | Values compiled into the client bundle (never secrets)|

In this codebase the pointer is `EXTERNAL_ENV_FILE` and the primary secret is `MONGODB_URI`. The names differ slightly from the generic table above, but the roles are the same: one variable points to the file, one holds the credential.

**Rules:**

- Prefix client-visible variables with `NEXT_PUBLIC_` (Next.js convention).
- Never prefix secrets with `NEXT_PUBLIC_`.
- Keep the project `.env` limited to public config and the secrets file path — not the secrets themselves.

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
