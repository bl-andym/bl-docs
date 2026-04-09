| Command                           | Why                                                                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **npm run format**                | You have hand-edited source files; keeps formatting consistent before commit.                                                       |
| **npm run generate-sanity-types** | Schema/fragments changed; refreshes generated Sanity artefacts so committed outputs match source.                                   |
| **npm run build**                 | Confirms Next.js + Studio still build successfully.                                                                                 |
| **npm run check-types**           | Optional alone. `npm run check` already includes typechecking via Turbo, so run this separately only for a quicker type-only check. |
| **npm run update-snapshots**      | Only if needed. Run when tests fail due to intentional snapshot changes.                                                            |
| **npm run check**                 | Recommended final verification step; covers the main checks in one go.                                                              |
| **extract-types (studio)**        | No separate need if included in root **`npm run generate-sanity-types`**.                                                           |
| **generate-types (web)**          | No separate need if included in root **`npm run generate-sanity-types`**.                                                           |
