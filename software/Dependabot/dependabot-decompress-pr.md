## DevOps 3840: PR review findings

### Summary

- `decompress@4.2.1` is removed.
- `@xhmikosr/decompress@10.2.1` is added directly.
- `@sanity/cli@3.99.0` still expects `decompress@^4.2.0`.
- `decompress` is not resolvable.
- The replacement package also fails to load because `strtok3` is missing from both `package-lock.json` and `node_modules`.
- `@xhmikosr/decompress@10.2.1` is itself reported vulnerable; the available fixed version is `11.1.3`.

|Finding|Evidence command|
|---|---|
|`decompress@4.2.1` is removed|`npm ls decompress @xhmikosr/decompress --all`|
|`@xhmikosr/decompress@10.2.1` is added directly|`npm explain @xhmikosr/decompress`|
|`@sanity/cli@3.99.0` still expects `decompress@^4.2.0`|`node -p "require('./packages/sanity-shared/node_modules/@sanity/cli/package.json').dependencies.decompress"`|
|`decompress` is not resolvable|`node -e "const {createRequire}=require('module'); const r=createRequire(require('path').resolve('packages/sanity-shared/node_modules/@sanity/cli/package.json')); try { console.log(r.resolve('decompress')) } catch(e) { console.error('NOT RESOLVABLE') }"`|
|Replacement fails because `strtok3` is missing|`node -e "const m=require('@xhmikosr/decompress'); console.log(typeof m, Object.keys(m))"`|
|`strtok3` is absent from `node_modules`|`npm explain strtok3`|
|`strtok3` is absent from `package-lock.json`|`git grep -n '"node_modules/strtok3"' package-lock.json`|

### Conclusions

- `@sanity/cli@3.99.0` declares `decompress@^4.2.0`.
- Investigation of the installed package found no runtime references to `decompress`, so it **appears unused in the inspected files**, but this has not been proven across every CLI code path.
- Because the dependency is declared in the published `@sanity/cli@3.99.0` package, it cannot be removed directly from this repository.
- There is no newer compatible Sanity 3 release that removes this dependency.
### Recommendation

Although `decompress@4.2.1` is removed, the remediation does not preserve the published dependency contract of `@sanity/cli@3.99.0`, the replacement package cannot be successfully loaded from the committed clean-install dependency graph, and the selected replacement version (`10.2.1`) is itself reported vulnerable.

A validated remediation should either use a supported upstream dependency chain or a controlled patch/fork of the published `@sanity/cli` package.

### Possible workaround
(Discuss with Richard and Jaran)

A **controlled fork** (a copy of the published npm package that the organisation owns and maintains).

1. Take the published `@sanity/cli@3.99.0` source.
2. Make the smallest validated change (for example, remove the `decompress` dependency if it is confirmed to be unused).
3. Publish it to our npm registry (or GitHub Packages) under a new package name, for example: `@bl-web/sanity-cli`
4. Point the project at that package instead of the published package.
   
Benefits:

- The package remains internally consistent.
- The exact change is controlled and reviewable.
- CI can validate the modified package.
- The workaround is reproducible.
- The fork can be retired once an official Sanity release addresses the dependency.

Compared with the current PR:

- **Current PR:** changes the dependency graph from outside the published package.
- **Controlled fork:** modifies the published package itself while preserving a consistent dependency contract.