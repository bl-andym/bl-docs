Findings for Storybook issue discovered when developing friendlyCaptcha

Devops: 3865
Branch: feature/devops-3865-email-signup-incorrect-msg-shown-on-submit-if-user-subscribed

These are the commands we used to reach the conclusion:

```bash
# Find where the specific status is handled
git grep -n "contacts:identifierConflict"
```

```bash
# Inspect the surrounding code to find where `code` is declared
sed -n '70,95p' packages/design-system/src/molecules/EmailSignup/index.tsx
```

```bash
# Find when `captcha.siteKey` was introduced
git log -S "captcha.siteKey" -- packages/design-system/src/molecules/EmailSignup/index.tsx
```

```bash
# Inspect the commit that introduced the captcha implementation
git show 86727bb796ac136cbacd24d99665afca28b2183d -- packages/design-system/src/molecules/EmailSignup/EmailSignup.stories.tsx packages/design-system/src/molecules/EmailSignup/index.tsx
```

### Key findings from those commands

* `git grep` identified where the `contacts:identifierConflict` response is handled.
* `sed` showed that `code` is extracted from the API response via:

  ```ts
  const code = ((await response.json()) as { status: string }).status;
  ```
* `git log -S` identified commit `86727bb` (`feat: initial captcha implementation`) as the point where `captcha.siteKey` was introduced.
* `git show` confirmed that `EmailSignup` began requiring a `captcha` prop in that commit, while the Storybook story was not updated, indicating the likely origin of the Storybook configuration issue.
