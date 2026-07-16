```
# CLI Interrogation Commands

| Command | Description | Command Parts |
|----------|-------------|---------------|
| `git grep -n "genericErrorText" -- '*.tsx'` | Find where `genericErrorText` is used in React components. | `git grep` = search tracked files, `-n` = show line numbers, `"genericErrorText"` = search text, `-- '*.tsx'` = limit to React TypeScript files. |
| `sed -n '70,110p' packages/design-system/src/molecules/EmailSignup/index.tsx` | Display the email signup submit handler logic without opening the full file. | `sed` = stream editor, `-n` = suppress normal output, `'70,110p'` = print lines 70-110, final path = target file. |
| `sed -n '1,70p' packages/design-system/src/molecules/EmailSignup/index.tsx` | Display the component setup, props and initial validation logic. | `sed` = stream editor, `-n` = suppress normal output, `'1,70p'` = print lines 1-70, final path = target file. |
| `sed -n '240,270p' apps/web/src/components/shared/ContentBlockRenderer/ContentBlockRenderer.tsx` | Show how the EmailSignup component is instantiated and configured. | `sed` = stream editor, `-n` = suppress normal output, `'240,270p'` = print lines 240-270, final path = target file. |
| `git grep -n "defaultEmailForm" -- '*.ts' '*.tsx'` | Locate where the email signup form configuration is defined and used. | `git grep` = search tracked files, `-n` = show line numbers, `"defaultEmailForm"` = search text, `--` = end options, file globs restrict search to TypeScript files. |
| `cat apps/web/src/lib/email-signup/email-signup.ts` | Display the email signup endpoint configuration and types. | `cat` = output entire file contents, path = target file. |
| `git grep -n "email-signup" -- apps/web/src/app` | Locate the Next.js API route handling email signup submissions. | `git grep` = search tracked files, `-n` = show line numbers, `"email-signup"` = search text, `-- apps/web/src/app` = restrict search path. |
| `cat apps/web/src/app/api/email-signup/route.ts` | Display the full email signup API implementation. | `cat` = output entire file contents, path = target file. |
| `grep -n -A 12 -B 4 "captcha" apps/web/src/config/server.ts` | Show the sections around captcha configuration in server config. | `grep` = search text, `-n` = show line numbers, `-A 12` = show 12 lines after match, `-B 4` = show 4 lines before match, `"captcha"` = search text. |
| `sed -n '50,95p' apps/web/src/config/server.ts` | Display the environment variable loading and secret configuration logic. | `sed` = stream editor, `-n` = suppress normal output, `'50,95p'` = print lines 50-95, final path = target file. |
| `if [ -n "$FRIENDLY_CAPTCHA_API_TOKEN" ]; then echo "FRIENDLY_CAPTCHA_API_TOKEN is set"; else echo "FRIENDLY_CAPTCHA_API_TOKEN is missing"; fi` | Check whether the FriendlyCaptcha token is available in the current shell environment. | `if` = conditional, `-n` = string not empty, `$FRIENDLY_CAPTCHA_API_TOKEN` = environment variable, `echo` = print result, `fi` = end conditional block. |
| `git grep -n "friendlyCaptchaApiToken"` | Locate all usages of the FriendlyCaptcha token variable in the codebase. | `git grep` = search tracked files, `-n` = show line numbers, `"friendlyCaptchaApiToken"` = search text. |
| `git log --oneline -- apps/web/src/app/api/email-signup/route.ts` | Show the commit history for the email signup API route. | `git log` = commit history, `--oneline` = compact format, `--` = separate options from path, final path = limit history to that file. |
| `git branch --show-current` | Show the current Git branch. | `git branch` = branch operations, `--show-current` = output only the active branch name. |
| `git status --short` | Show whether the working tree contains local modifications. | `git status` = repository state, `--short` = compact output format. |
```