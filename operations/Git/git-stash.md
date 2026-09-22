List all stashes

```bash
git stash list
```

Filter stashes

```bash
git stash list | grep "fast-uri"
```

Show stash summary

```bash
git stash show --stat 'stash@{0}'
```

Show stash patch

```bash
git stash show -p 'stash@{0}'
```

Show files changed in stash

```bash
git diff --name-only 'stash@{0}^1' 'stash@{0}'
```

Show one file's stashed changes

```bash
git diff 'stash@{0}^1' 'stash@{0}' -- path/to/file
```

Apply stash — keeps stash

```bash
git stash apply 'stash@{0}'
```

Pop stash — applies and removes stash

```bash
git stash pop 'stash@{0}'
```

Create named stash

```bash
git stash push -m "description"
```

Drop specific stash

```bash
git stash drop 'stash@{0}'
```