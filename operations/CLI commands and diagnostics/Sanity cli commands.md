# Sanity CLI commands

Commands for Sanity CMS CLI workflows: authentication, dataset import, document queries, and schema validation.

Used with the **layer-cake-lesson** repo and Sanity tutorials. For npm dependency and Dependabot work, see [dependabot-remediation.md](./dependabot-remediation.md).

See also: [CLI commands and diagnostics index](./README.md)

---

## Authentication

```bash
# Log in (interactive; choose GitHub, Google, or email in the browser)
pnpm dlx sanity@latest login

# Log in with a specific provider (use the one tied to the project owner)
pnpm dlx sanity@latest login --provider github
pnpm dlx sanity@latest login --provider google

# Log in via organisation SAML SSO (work account)
pnpm dlx sanity@latest login --sso <org-slug>

# Log in with an API token from stdin (when browser/SSO is awkward)
pnpm dlx sanity@latest login --with-token

# Log out of the current CLI session
pnpm exec sanity logout

# Remove stored CLI credentials (after logout)
rm -rf ~/.config/sanity

# Stop the shell from overriding CLI login with a token
unset SANITY_AUTH_TOKEN
```

---

## Who am I / which projects?

```bash
# Show logged-in user, project/dataset from this repo, CLI version
pnpm exec sanity debug

# Same, including the auth token value (sensitive)
pnpm exec sanity debug --secrets

# List Sanity projects this account can access
pnpm exec sanity projects list
```

---

## Dataset import

Course exports typically use `production.tar.gz`:

```bash
# Import into the production dataset (no -y flag on import)
pnpm dlx sanity@latest dataset import production.tar.gz --dataset production

# Short form of --dataset
pnpm dlx sanity@latest dataset import production.tar.gz -d production

# Re-import and overwrite documents that already exist
pnpm dlx sanity@latest dataset import production.tar.gz --dataset production --replace

# Deprecated positional dataset (still works; prefer --dataset)
pnpm dlx sanity@latest dataset import production.tar.gz production
```

---

## Inspect dataset contents

```bash
# Total document count in a dataset
pnpm exec sanity documents query 'count(*)' --dataset production

# List every document id and type
pnpm exec sanity documents query '*[]{_id,_type}' --dataset production

# Count imported course content (artist / event / venue)
pnpm exec sanity documents query 'count(*[_type in ["artist","event","venue"]])' --dataset production
```

---

## Bulk validation

```bash
# Validate all documents against local Studio schema (confirms pitfalls first)
pnpm dlx sanity@latest documents validate

# Same, skip the pitfalls confirmation prompt
pnpm dlx sanity@latest documents validate -y

# Validate a different dataset than .env (e.g. Layer Caker content in development)
pnpm dlx sanity@latest documents validate --dataset development -y
```

---

## Diagnostics and course setup

```bash
# Check whether CLI auth config files exist (not a Sanity subcommand)
ls -la ~/.config/sanity

# Create a new project + Studio (Day One course prerequisite)
pnpm create sanity@latest --template clean --create-project "Day One Content Operations" --dataset production --typescript --output-path day-one/apps/studio
```

---

## Flags to avoid mixing up

| Flag | Works on | Does not work on |
|------|----------|------------------|
| `-y` | `documents validate` | `dataset import` |
| `--dataset` / `-d` | `dataset import`, `documents query`, `documents validate` | — |

---

## Typical end-to-end sequence

```bash
cd /path/to/layer-cake-lesson

pnpm exec sanity logout && rm -rf ~/.config/sanity
pnpm dlx sanity@latest login --provider google   # or github, for the account that owns the project

pnpm exec sanity debug
pnpm exec sanity projects list                   # should include your Project ID

pnpm dlx sanity@latest dataset import production.tar.gz --dataset production
pnpm exec sanity documents query 'count(*[_type in ["artist","event","venue"]])' --dataset production

pnpm dlx sanity@latest documents validate -y
```

---

## Notes

- **User** block in `sanity debug` = CLI login identity (not controlled by `.env` comments).
- **Studio** project/dataset in `sanity debug` = `NEXT_PUBLIC_SANITY_*` in `.env.local` + `sanity.cli.ts`.
- CLI auth is stored at `~/.config/sanity/config.json` (not in this repo).
- Course import targets **Day One** types (`artist`, `event`, `venue`); the monorepo schema is **Layer Caker** (`post`, `page`, etc.).
