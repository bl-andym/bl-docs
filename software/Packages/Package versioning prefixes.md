# npm Version Prefixes

| Prefix             | Example          | Meaning                         | Comment                                           |
| ------------------ | ---------------- | ------------------------------- | ------------------------------------------------- |
| `^`                | `^7.3.1`         | `>=7.3.1 <8.0.0`                | Allows minor and patch updates.                   |
| `~`                | `~7.3.1`         | `>=7.3.1 <7.4.0`                | Allows patch updates only.                        |
| None               | `7.3.1`          | Exactly `7.3.1`                 | Fully pinned. No automatic updates.               |
| `>`                | `>7.3.1`         | Greater than `7.3.1`            | Any version above the specified version.          |
| `>=`               | `>=7.3.1`        | `7.3.1` or newer                | Includes the specified version and above.         |
| `<`                | `<8.0.0`         | Less than `8.0.0`               | Sets an upper bound on allowed versions.          |
| `<=`               | `<=7.3.5`        | Up to and including `7.3.5`     | Includes the specified version and below.         |
| Range              | `>=7.3.1 <8.0.0` | Explicit lower and upper bounds | Defines both minimum and maximum allowed versions. |
| `*`                | `*`              | Any version                     | No version restrictions.                          |
| `x` / `*` wildcard | `7.x`            | Any `7.*.*` version             | Restricts updates to a specific major version.    |
| `latest`           | `latest`         | Latest npm dist-tag             | Resolves to the package's current `latest` release. |
