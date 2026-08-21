## Working mental model

When assessing a transitive dependency update, first check whether the parent dependency permits a newer version:

```text
@sanity/client
└── nanoid ^x.x.x
    // Compatible version range available
    // Lockfile-only update may be sufficient
```

```text
@sanity/client
└── nanoid x.x.x
    // Exact version pinned
    // Lockfile-only update is not sufficient
```

