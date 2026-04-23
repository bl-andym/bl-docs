# Dependency Vulnerability Resolution Rationale

The chosen approach:

Upgrading the upstream dependency (`@sanity/plugin-kit`) to remove the vulnerable transitive package (`parse-git-config`), rather than applying overrides or patching downstream.

This aligns with:
- GitHub / Dependabot guidance  
- npm ecosystem best practices  
- industry-standard supply chain security principles  

---

## 1. Official: GitHub Advisory / Dependabot guidance

### Key principle  
Vulnerabilities should be resolved by upgrading the dependency that introduces them wherever possible.

Guidance from GitHub Security Advisories and Dependabot recommends:
- upgrading the parent dependency introducing the vulnerability  
- avoiding workarounds such as overrides unless no alternative exists  
- removing the vulnerable package from the dependency graph  

### Application  

Dependency chain:
parse-git-config (vulnerable)
↑
git-user-info
↑
@sanity/plugin-kit

Upgrading `@sanity/plugin-kit` removed the vulnerable dependency path.

---

## 2. Official: npm documentation

### Key principle  
Semver-compatible upgrades should be used to resolve vulnerabilities rather than forcing resolutions.

npm recommends:
- upgrading dependencies within supported version ranges  
- avoiding overrides (`overrides`, `resolutions`)  
- allowing dependency trees to resolve naturally  

### Application  

The solution:
- upgraded `@sanity/plugin-kit`  
- allowed npm to re-resolve the dependency tree  
- removed the vulnerable package organically  

---

## 3. Official: OpenSSF guidance

### Key principle  
Risk should be reduced by removing or eliminating vulnerable dependencies rather than patching locally.

OpenSSF recommends:
- removing vulnerable dependencies  
- preferring upstream fixes  
- avoiding forks unless necessary  

### Application  

The approach:
- no local patching  
- no forking  
- full removal via upgrade  

---

## 4. Industry practice

### Standard hierarchy
1. Upgrade parent dependency  
2. Override dependency  
3. Patch locally  
4. Fork  

The chosen approach follows the preferred path.

---

## 5. Dependabot patterns

Typical patterns:
- upgrade introducing dependency  
- align versions  
- regenerate lockfile  

This implementation follows those patterns.

---

## 6. Dependency graph integrity

Principle:
Dependency resolution should be handled by the package manager.

The solution:
- no overrides  
- no forced resolutions  
- clean dependency graph  

---

## Summary

- Upgraded `@sanity/plugin-kit`
- Removed `parse-git-config`
- Followed official and industry best practices

Result:
- clean dependency tree
- no vulnerable packages
- maintainable solution
