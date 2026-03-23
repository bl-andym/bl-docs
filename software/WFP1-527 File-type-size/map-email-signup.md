**File:** `apps/web/src/utils/prop-mappers/map-email-signup.ts`  
**Block:** `map-email-signup`
**Feature:** WFP1-527 asset file type and size display
## Purpose

Transforms a CMS **Email signup** content block (`EmailSignup` from the page API) into props for the design-system **`EmailSignup`** component (`EmailSignupProps`). This is the standard “prop mapper” pattern used for other blocks (e.g. `mapMediaDownloadGrid`, `mapButton`).

## Logic

| Input field | Output prop | Transformation |
|-------------|-------------|----------------|
| `title`, `description`, `firstNamePlaceholder`, `emailPlaceholder`, `buttonText`, `genericErrorText`, `alreadySignedUpErrorText` | Same names | Passed through unchanged |
| `caption` | `caption` | `mapRichText(emailSignup.caption)` — portable text → component-ready rich text (links, marks, including asset links) |
| `succesText` | `succesText` | `mapRichText(emailSignup.succesText)` — same as above (schema spelling: `succesText`) |
| — | `form` | Placeholder `{ endpoint: '' }` — **overridden** at render time |
| — | `captcha` | Placeholder `{ siteKey: '' }` — **overridden** at render time |

There is no branching: one object in, one props object out.

## Why `mapRichText` on caption / succesText

Those fields are Sanity portable text. `mapRichText` normalises them to the shape the design system expects and resolves inline links (including asset links) consistently with the rest of the app.

## Where it is implemented / used

1. **Definition:** `apps/web/src/utils/prop-mappers/map-email-signup.ts` — exports `mapEmailSignup`.

2. **Consumption:** `apps/web/src/components/shared/ContentBlockRenderer/ContentBlockRenderer.tsx`  
   - In the `switch` on `block._type`, case `'emailSignup'`:  
     - `const props = mapEmailSignup(block);`  
     - `return <EmailSignup key={block._key} {...props} form={defaultEmailForm} captcha={clientConfig.captcha} />;`  
   - **`form` and `captcha`** are **not** taken from the mapper’s placeholders in practice: they are passed explicitly after the spread so `defaultEmailForm` and `clientConfig.captcha` win.

3. **Types:**  
   - Input: `EmailSignup` from `@/types/content-blocks` (narrowed union member for `_type: 'emailSignup'`).  
   - Output: `EmailSignupProps` from `@bl-web/design-system/molecules/EmailSignup`.

## Data path (high level)

Sanity (email signup document) → page GROQ (content fragment) → API response → ContentBlockRenderer receives block → mapEmailSignup(block) → EmailSignup component

The mapper does **not** call the network; it only shapes data already loaded for the page.