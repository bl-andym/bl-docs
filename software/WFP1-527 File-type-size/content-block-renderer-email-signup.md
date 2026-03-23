**File:** `apps/web/src/components/shared/ContentBlockRenderer/ContentBlockRenderer.tsx`
**Block:** `case 'emailSignup':`  
**Feature:** WFP1-527 asset file type and size display

---

## Why the change was needed

1. **Same pattern as other blocks**  
   Other blocks use a prop mapper (`map*`) and then spread props into the design-system component.  
   Email signup was the only block passing the raw CMS block directly into `<EmailSignup>`, which was inconsistent and coupled the renderer to the CMS shape.

2. **Centralised mapping**  
   Moving the logic into `mapEmailSignup` creates a single place responsible for converting the CMS block into `EmailSignupProps`.  
   This includes handling rich text, defaults, and any future normalisation.

3. **Rich text / asset links**  
   Caption and success text can contain rich text (for example asset links).  
   These must pass through `mapRichText` (handled in `map-email-signup.ts`) so links and formatting render correctly.

   Passing the raw fields would skip that mapping:

   - `block.description`
   - `block.caption`
   - `block.succesText`

4. **Types**  
   Using `mapEmailSignup(block)` ensures the renderer works with `EmailSignupProps` instead of the raw CMS block shape.  
   This improves type safety and simplifies future refactoring.

---

## Before

```tsx
case 'emailSignup': {
  return (
    <EmailSignup
      key={block._key}
      title={block.title}
      form={defaultEmailForm}
      emailPlaceholder={block.emailPlaceholder}
      firstNamePlaceholder={block.firstNamePlaceholder}
      buttonText={block.buttonText}
      description={block.description}
      caption={block.caption}
      captcha={clientConfig.captcha}
      genericErrorText={block.genericErrorText}
      alreadySignedUpErrorText={block.alreadySignedUpErrorText}
      succesText={block.succesText}
    />
  );
}
```

### Rationale (before)

- Simple and explicit: each prop came straight from the CMS block.
- No extra mapper file required.

**Downsides:**

- Renderer depended on the raw block structure.
- Inconsistent with other block render patterns.
- Caption and success text were not passed through `mapRichText`, so rich text or asset links would not render correctly.

---

## After

```tsx
case 'emailSignup': {
  const props = mapEmailSignup(block);

  return (
    <EmailSignup
      key={block._key}
      {...props}
      form={defaultEmailForm}
      captcha={clientConfig.captcha}
    />
  );
}
```

### Rationale (after)

**Consistency**

Uses the same pattern as other blocks:

```
CMS block → mapper → props → design system component
```

Examples:

- `mapHighlightBannerIllustration`
- `mapMediaDownloadGrid`

**Mapping in one place**

`mapEmailSignup(block)` (in `map-email-signup.ts`) now owns the block → props conversion.

Responsibilities include:

- applying `mapRichText` to rich text fields
- normalising CMS data
- ensuring the output matches `EmailSignupProps`

**Runtime dependencies remain in the renderer**

The renderer still provides:

- `form` → `defaultEmailForm`
- `captcha` → `clientConfig.captcha`

These are application/runtime concerns, not CMS content.

**Types**

The component now receives `EmailSignupProps`, so the renderer no longer depends directly on the CMS block type.

**Rich text support**

Fields such as `caption` and `succesText` are processed via `mapRichText` inside the mapper, ensuring:

- asset links work correctly
- formatting renders properly

---

## Summary

| Aspect | Before | After |
|------|------|------|
| Data flow | Block fields passed directly | Block → `mapEmailSignup(block)` → props → `<EmailSignup {...props}>` |
| Rich text | `block.caption` / `block.succesText` used directly | Mapper processes them using `mapRichText()` |
| Form / captcha | Set in renderer | Still set in renderer (overriding mapper placeholders) |
| Pattern | Unique in `ContentBlockRenderer` | Aligned with other content blocks |
| Mapping location | Inline in renderer | `apps/web/src/utils/prop-mappers/map-email-signup.ts` |

---

The commented-out return represents the previous implementation.  
The current **two-line case using `mapEmailSignup(block)`** is the desired implementation and should remain.

Once the team confirms the behaviour is correct, the commented code can be removed.
