**File:** `apps/web/src/utils/prop-mappers/map-email-signup.ts`  
**Block:** `map-email-signup`  
**Feature:** WFP1-527 asset file type and size display

## Purpose

Transforms a CMS **Email signup** content block (`EmailSignup` from the page API) into props for the design-system **`EmailSignup`** component (`EmailSignupProps`). This is the standard “prop mapper” pattern used for other blocks (e.g. `mapMediaDownloadGrid`, `mapButton`).

## Before

There was no `map-email-signup.ts`. `ContentBlockRenderer` passed the CMS `emailSignup` block straight into `<EmailSignup>`:

- Strings (`title`, `description`, placeholders, `buttonText`, error texts) were passed unchanged through `ContentBlockRenderer` only, no mapper. Each string was copied from the CMS block onto the matching component prop, e.g. `title={block.title}`,  `buttonText={block.buttonText}`.
- `caption` and `succesText` were passed as raw Sanity portable text (`block.caption`, `block.succesText`).
- `form` and `captcha` were already injected at render time (`defaultEmailForm`, `clientConfig.captcha`). They were injected as normal JSX props on the same `<EmailSignup>` call, not from the CMS block:
```jsx
<EmailSignup
	title={block.title} // CMS data (`title`, `caption`, `succesText`...etc).
	caption={block.caption} // ""
	succesText={block.succesText} // ""
	form={defaultEmailForm} // Injected at render time
	captcha={clientConfig.captcha} // ""
	// ...
/>
```

**Rationale:** Email signup was treated as a simple field pass-through. Most props are plain strings, so a mapper was never added. That left the two portable-text fields outside the shared rich-text path used by other blocks.

**Gap:** An asset link in caption or success copy had no `mapRichText` / `mapLink` pass, so it did not get a resolved download `href` and did **not** show file format and size immediately after the link text. 

## After

`mapEmailSignup` is the single transform: one CMS object in, one `EmailSignupProps` object out. The renderer becomes:

```ts
const props = mapEmailSignup(block);
return <EmailSignup key={block._key} {...props} form={defaultEmailForm} captcha={clientConfig.captcha} />;
```

### Logic

| Input field                                                                                                                      | Output prop  | Transformation                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `title`, `description`, `firstNamePlaceholder`, `emailPlaceholder`, `buttonText`, `genericErrorText`, `alreadySignedUpErrorText` | Same names   | Passed through unchanged                                                                                            |
| `caption`                                                                                                                        | `caption`    | `mapRichText(emailSignup.caption)`, portable text → component-ready rich text (links, marks, including asset links) |
| `succesText`                                                                                                                     | `succesText` | `mapRichText(emailSignup.succesText)`, same as above (schema spelling: `succesText`)                                |
| -                                                                                                                                | `form`       | Placeholder `{ endpoint: '' }`, **overridden** at render time                                                       |
| -                                                                                                                                | `captcha`    | Placeholder `{ siteKey: '' }`, **overridden** at render time                                                        |

There is no branching: one object in, one props object out.

The component UI does not change. Only the data path for `caption` and `succesText` does. WFP1-527 is about asset link titles showing format and size. `form` and `captcha` are runtime config (API endpoint and captcha site key), not CMS rich text, so they were never missing metadata.

API endpoint is the URL the form POSTs to: `/api/email-signup`. That Next.js route receives name, email, and captcha, then talks to Dotdigital. Editors do not set that URL in the email-signup block.

Captcha site key is the Friendly Captcha public key from config, used to render the widget. Same idea: app config, not CMS.

The mapper can put empty placeholders on those props so the return type matches `EmailSignupProps`. The renderer then does `{...props} form={defaultEmailForm} captcha={clientConfig.captcha}`. In JSX, later props win, so the real values replace the placeholders. Same as before the mapper existed.

`EmailSignupProps` requires `form` and `captcha`. The mapper only has CMS fields, so it cannot supply a real endpoint or site key. It returns stubs instead, e.g. `{ endpoint: '' }` and `{ siteKey: '' }`, so the object type-checks.

Those stubs are not used. The renderer always passes the real `form` and `captcha` after `{...props}`, so they overwrite the empties. The placeholders exist only to satisfy the type; behaviour is unchanged from when the renderer set those two props itself.

**Rationale (after):** Caption and success text are Sanity portable text. Routing them through `mapRichText` matches other components such as accordion, highlight banners, and text & image: inline links are <sup>1</sup> normalised, asset links get a download `href`, and **file format and size are appended immediately after the linked text** (`Annual report (PDF, 1.2MB)`). That is the WFP1-527 behaviour for this block.

<sup>1</sup> **normalised**: the CMS link object is turned into the shape `DsLink` expects: `href`,  `linkType`, `openInNewTab`.

Sanity stores `linkType` plus page / url / asset. 
A CMS link is one object with a **type**, then only the field for that type is filled:

| `linkType` | What Sanity stores |
| --- | --- |
| `internal` | `page` — reference to a site page |
| `external` | `url` — a full URL |
| `asset` | `asset` — file or image |

`mapLink` reads `linkType` and the matching field, and outputs one `href`.

`mapLink` turns that into a single `href` (internal path, external URL, or download URL). The component does not have to understand Sanity’s link fields.

## Why `mapRichText` on caption / succesText

`caption` and `succesText` are **portable text**: an array of blocks with marks (bold, italic, links), not a plain string. The design-system `RichText` component renders that array. A link in the CMS is a `markDef` (`linkType` internal / external / asset), not an `<a href>` yet.

**`mapRichText`** `loops over each portable-text block, then over that block’s link marks and text children, and updates them as it goes. No special algorithm, just “iterate the tree”.

1. Runs each link through **`mapLink`** so `href` is a real URL (for assets: `/api/download/…` or the CDN `?dl` URL).
2. For `linkType: 'asset'`, rewrites the linked words with **`getAssetLabelWithMetadata`**, e.g. `Privacy policy` → `Privacy policy (PDF, 1.2MB)`.

Other blocks (accordion, highlight banners, text & image) already do this. Email signup did not: the renderer passed `block.caption` and `block.succesText` straight through. The `RichText` component could still show a link, but it never got the mapped `href` or the format/size suffix.

That is why only these two fields go through `mapRichText`. `title`, placeholders, and button label are strings; there is nothing to normalise. WFP1-527 is satisfied here only if asset links in caption and success copy pick up the same suffix as everywhere else.

## Where it is implemented / used

1. **Definition:** `apps/web/src/utils/prop-mappers/map-email-signup.ts` exports `mapEmailSignup`.

2. **Consumption:** `apps/web/src/components/shared/ContentBlockRenderer/ContentBlockRenderer.tsx`  
   - In the `switch` on `block._type`, case `'emailSignup'`:  
     - `const props = mapEmailSignup(block);`  
     - `return <EmailSignup key={block._key} {...props} form={defaultEmailForm} captcha={clientConfig.captcha} />;`  
   - **`form` and `captcha`** are **not** taken from the mapper’s placeholders in practice: they are passed explicitly after the <sup>1</sup>spread so `defaultEmailForm` and `clientConfig.captcha` win.

3. **Types:**  
   - Input: `EmailSignup` from `@/types/content-blocks` (narrowed union member for `_type: 'emailSignup'`).  
   - Output: `EmailSignupProps` from `@bl-web/design-system/molecules/EmailSignup`.

<sup>1</sup>**spread** (`...`) copies the properties of one object into another.

In JSX, `{...props}` is the same as passing every key on `props` as its own attribute. Anything you write **after** that overrides a key with the same name:

```tsx
<EmailSignup {...props} form={defaultEmailForm} captcha={clientConfig.captcha} />
```

If `props` already has `form` / `captcha` (the mapper placeholders), those values are applied first, then replaced by `defaultEmailForm` and `clientConfig.captcha`.

Elsewhere it is the same idea: `{...a, ...b}` in an object, `[...arr]` for arrays, or `fn(...args)`. Later wins when names clash. It is copy-into, not a special React feature.

## Data path (high level)

Sanity (email signup document) → page GROQ (content fragment) → API response → ContentBlockRenderer receives block → mapEmailSignup(block) → EmailSignup component

The mapper does **not** call the network; it only shapes data already loaded for the page.