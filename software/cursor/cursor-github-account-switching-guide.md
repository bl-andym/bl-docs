# Switching Between Personal and Company Accounts (Cursor + GitHub)

## 1. Cursor Account

Check which Cursor account is active:

```text
Cursor → Settings → General
```

Verify the displayed email address.

If incorrect:

```text
Settings → Sign Out
```

Then sign back in with the required account.

---

## 2. Cursor Web Session

If Cursor login keeps suggesting the wrong account:

1. Sign out of Cursor website.
2. Go back to Cursor IDE.
3. Select Sign In.
4. Enter the desired email address.

---

## 3. GitHub Account

Check which GitHub credential Git is currently using:

```bash
git credential-manager get
```

Input:

```text
protocol=https
host=github.com
```

If the username is incorrect, clear it:

```bash
git credential-manager erase
```

Input:

```text
protocol=https
host=github.com
```

Then perform:

```bash
git fetch origin
```

and sign in with the correct GitHub account.

---

## 4. Verify Repository Access

Confirm Git can access the repository:

```bash
git fetch origin
```

Expected: fetch succeeds.

Common symptom of wrong account:

```text
Repository not found
```

---

## 5. Check Commit Identity

Verify commits will be attributed correctly:

```bash
git config user.name
git config user.email
```

For company repos:

```bash
git config user.name "Company Username"
git config user.email "company@email.com"
```

For personal repos:

```bash
git config user.name "Personal Username"
git config user.email "personal@email.com"
```

---

## 6. Check Remote URL

Verify you're pointing at the expected repository:

```bash
git remote -v
```

Example:

```text
https://github.com/BritishLibrary-official/BL.Web.git
```

---

## 7. If Using Different GitHub Accounts Frequently

### Option A - HTTPS + Credential Manager

- Simplest.
- Sign out/in when switching.
- Good for occasional switching.

### Option B - Separate SSH Keys (recommended for frequent switching)

- Personal GitHub account uses one SSH key.
- Company GitHub account uses another SSH key.
- Git automatically chooses the correct identity per repository.
- No repeated login/logout cycle.

---

## Quick Checklist

```text
✓ Correct Cursor account signed in
✓ Correct Cursor web session
✓ Correct GitHub credential cached
✓ git fetch origin succeeds
✓ git config user.email is correct
✓ git remote -v is correct
✓ Repository access confirmed
```

## Common Cause

The most common cause of this issue is:

**Cursor account changed successfully, but GitHub credentials remained cached from the previous account.**
