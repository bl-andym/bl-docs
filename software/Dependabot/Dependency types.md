In npm, the main dependency types are:

- **Direct dependency** — explicitly listed in your `package.json`. You control its version directly.
    
    ```text
    your-app → next
    ```
    
- **Transitive dependency** — installed because one of your dependencies requires it. Not directly listed in your `package.json`.
    
    ```text
    your-app → plugin-kit → pkg-utils → ajv → fast-uri
    ```
    
    `fast-uri` is **transitive**.
    
- **devDependency** — direct dependency needed for development/build/test tooling, but normally not application runtime.
    
    ```json
    "devDependencies": {
      "vitest": "..."
    }
    ```
    
- **peerDependency** — a package says _the consuming project must provide a compatible version_ of another package. Common with React/plugins.
    
- **optionalDependency** — npm attempts to install it, but installation failure doesn't necessarily fail the whole install.
    

For Dependabot, the key distinction is usually **direct vs transitive**. Direct vulnerabilities can normally be fixed by upgrading your declared dependency; transitive ones require finding which parent dependency controls the vulnerable package—as we're doing with `fast-uri`.