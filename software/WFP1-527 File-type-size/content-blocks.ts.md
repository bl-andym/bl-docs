**File:** `apps/web/src/types/content-blocks.ts`
**Block:** block-level TypeScript types 
**Feature:** WFP1-527 asset file type and size display

## Overview

The file defines **block-level TypeScript types** for the content blocks returned by the page APIs.

It:

- Takes the `content` array type from the page models (Home, Hub, Content, List, Overview)
- Treats that as the **union of all block variants** (`ContentBlocks`)
- Exports one type per block by narrowing on `_type`  
  (e.g. `Extract<ContentBlocks[number], { _type: 'emailSignup' }>`)

This makes it the **single source of truth** where a “block name” is tied to the **shape of that block** in the app.

---

# EmailSignup as a case study

The API returns something like:

```
content: Array<TextCardGrid | MediaDownloadGrid | EmailSignup | ...>
```

This file defines:

```
EmailSignup = Extract<ContentBlocks[number], { _type: 'emailSignup' }>
```

This allows TypeScript to know exactly which fields an `emailSignup` block has, for example:

- `title`
- `caption`
- `buttonText`
- etc.

---

## Why this matters

- `mapEmailSignup(block: EmailSignup)` can use these fields with **full type safety**
- `ContentBlockRenderer` can type the `emailSignup` case correctly
- Without this alias, you would be working with the full union and relying on manual `_type` checks

---

## Summary

For `EmailSignup`, the role of this file is to:

- Take a generic **“some content block” union**
- Narrow it to a **concrete `EmailSignup` type**
- Enable **type-safe mappers and rendering logic**
