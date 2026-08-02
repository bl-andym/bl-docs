# File: `packages/design-system/src/molecules/EmailSignup/index.tsx`

## Objective:

Enhance the email signup flow to correctly handle single-use FriendlyCaptcha tokens by invoking the `FriendlyCaptcha` reset API and clearing the stored captcha solution whenever a submission fails, the captcha expires, or the widget reports an error.

---
## Change index:

- Imported `FriendlyCaptchaHandle`
- Added `captchaWidgetRef`
- Added `resetCaptcha`
- Reset the captcha after unsuccessful submissions
- Added `resetCaptcha` to the dependency array
- Cleared the stored captcha solution on widget errors
- Cleared the stored captcha solution when the captcha expired
- Passed the forwarded ref to `FriendlyCaptchaWidget`

---

**Note**: Code comments only appear in this documentation and not in the source code.

## ✅ Imported `FriendlyCaptchaHandle`

**Replaced:**

```ts
import FriendlyCaptchaWidget from '../../internal/Captcha';
```

**With:**

```ts
/*
 * `type FriendlyCaptchaHandle`
 * → Imports the `FriendlyCaptchaHandle` type exported by the
 *   `FriendlyCaptcha` component.
 *
 * `type`
 * → Indicates that this is a TypeScript type-only import.
 * → The type is used for compile-time type checking only and is
 *   removed from the compiled JavaScript.
 *
 * `FriendlyCaptchaHandle`
 * → Describes the public API exposed by the `FriendlyCaptcha`
 *   component via `useImperativeHandle()`.
 * → Allows TypeScript to recognise that the component reference
 *   exposes a `reset()` method.
 */
import FriendlyCaptchaWidget, {
  type FriendlyCaptchaHandle,
} from '../../internal/Captcha';
```

**Rationale:**

The `EmailSignup` component needs the `FriendlyCaptchaHandle` type so it can create a strongly typed ref to the `FriendlyCaptcha` component and invoke its exposed `reset()` method. A less specific or untyped ref would not enforce the component's intended public API or catch incorrect method calls during development.

**With an untyped ref:**
```ts
const captchaWidgetRef = useRef<any>(null);

captchaWidgetRef.current?.reset();    // ✓
captchaWidgetRef.current?.destroy();  // ✓
captchaWidgetRef.current?.refresh();  // ✓
captchaWidgetRef.current?.banana();   // ✓
// TypeScript allows all of these because `any` disables type checking.
```

**With a strongly typed ref:**
```ts
const captchaWidgetRef = useRef<FriendlyCaptchaHandle | null>(null);

captchaWidgetRef.current?.reset();    // ✓
captchaWidgetRef.current?.destroy();  // ❌ Compile error
captchaWidgetRef.current?.refresh();  // ❌ Compile error
captchaWidgetRef.current?.banana();   // ❌ Compile error
```

**Previous functionality restriction:**

The component could render the captcha widget but had no typed mechanism for interacting with its exposed API.

---

## ✅ Added `captchaWidgetRef`

**Added:**

```ts
/*
 * `useRef<
 *   Q: What type of value will be stored?
 *   A: FriendlyCaptchaHandle | null>`
 *
 * Lifecycle:
 * → Before mounting: `null` // which one?
 * → After mounting: `FriendlyCaptchaHandle`
 * → After unmounting: `null` // which one?
 *
 * Outer generic (`useRef<...>`)
 * → "What type of value will be stored?"
 * → A reference to the `FriendlyCaptcha` component, or `null`.
 *
 * Union (`FriendlyCaptchaHandle | null`)
 * → Before the component is mounted, no `FriendlyCaptcha` instance
 *   exists, so the ref is `null`.
 * → After mounting, the ref stores the `FriendlyCaptchaHandle`,
 *   exposing the public `reset()` method.
 * → After the component unmounts, React clears the ref back to
 *   `null` because the component instance no longer exists.
 *
 * `(null)`
 * → Initialises the ref before the `FriendlyCaptcha` component has
 *   been mounted.
 * → After mounting, React assigns the object exposed via
 *   `useImperativeHandle()` to `captchaWidgetRef.current`.
 * → After unmounting, React automatically resets
 *   `captchaWidgetRef.current` back to `null`.
 * → This allows `EmailSignup` to safely call:
 *   captchaWidgetRef.current?.reset();
 *
 * Mental note:
 * myRef = useRef<useThisType or useNull>(but start as null)
 */
const captchaWidgetRef = useRef<FriendlyCaptchaHandle | null>(null);
```

**Rationale:**

The ref stores a reference to the `FriendlyCaptcha` component, allowing `EmailSignup` to invoke its exposed `reset()` method whenever the captcha must be regenerated.

**Previous functionality restriction:**

No reference to the `FriendlyCaptcha` component was retained after rendering, preventing the component from resetting the widget programmatically.

---

## ✅ Added `resetCaptcha()`

**Added:**

```ts
/*
 * `useCallback(() => { ... }, [])`
 * → Creates a memoised function whose reference remains stable
 *   between component re-renders.
 *
 * First argument (`() => { ... }`)
 * → The callback function that will be executed when
 *   `resetCaptcha()` is invoked.
 *
 * `setCaptchaSolution(undefined)`
 * → Clears the stored FriendlyCaptcha response token.
 * → Prevents a previously issued single-use token from being
 *   reused after a failed submission, widget error, or expiry.
 *
 * `captchaWidgetRef.current?.reset()`
 * → Invokes the `reset()` method exposed by the `FriendlyCaptcha`
 *   component, if the component has been mounted.
 * → Generates a new FriendlyCaptcha challenge for the next
 *   submission attempt.
 *
 * Optional chaining (`?.`)
 * → Prevents `reset()` from being called when
 *   `captchaWidgetRef.current` is `null`, avoiding a runtime error.
 *
 * Second argument (`[]`)
 * → An empty dependency array.
 * → The callback is created during the initial render and the same 
 * function reference is reused on subsequent renders.
 */
const resetCaptcha = useCallback(() => {
  setCaptchaSolution(undefined);
  captchaWidgetRef.current?.reset();
}, []); // Empty dependency array: React reuses the same function reference.
```

**Rationale:**

Centralising the reset behaviour into a single helper ensures every failure path consistently clears the stored captcha solution and regenerates the FriendlyCaptcha challenge.

**Previous functionality restriction:**

Each failure path required its own reset logic, increasing the risk that the captcha solution or widget state would become inconsistent.

---

## ✅ Reset the captcha after unsuccessful submissions

**Updated:**

```ts
/*
 * `if (code === 'contacts:identifierConflict')`
 * → Detects the Dotdigital response indicating that the submitted
 *   email address is already registered.
 *
 * `setError(alreadySignedUpErrorText)`
 * → Displays the configured "already signed up" message to the user.
 *
 * `resetCaptcha()`
 * → Clears the stored FriendlyCaptcha solution and resets the widget.
 * → Ensures the next submission uses a new captcha solution rather
 *   than attempting to reuse the previous single-use token.
 *
 * `return`
 * → Stops further execution because the error has been handled.
 */
if (code === 'contacts:identifierConflict') {
  setError(alreadySignedUpErrorText);
  resetCaptcha();
  return;
}

/*
 * `setError(genericErrorText)`
 * → Displays a generic error message for all other unsuccessful
 *   server responses.
 *
 * `resetCaptcha()`
 * → Clears the stored FriendlyCaptcha solution and resets the widget.
 * → Ensures the next submission uses a new captcha solution.
 *
 * `return`
 * → Stops further execution because the error has been handled.
 */
setError(genericErrorText);
resetCaptcha();
return;
```

and

```ts
/*
 * `catch`
 * → Executes when an exception occurs while parsing the server
 *   response or processing the unsuccessful submission.
 *
 * `setError(genericErrorText)`
 * → Displays a generic error message to the user.
 *
 * `resetCaptcha()`
 * → Clears the stored FriendlyCaptcha solution and resets the widget.
 * → Ensures the next submission uses a new captcha solution.
 *
 * `return`
 * → Stops further execution because the exception has been handled.
 */
catch {
  setError(genericErrorText);
  resetCaptcha();
  return;
}
```

and

```ts
/*
 * `catch`
 * → Executes when an exception occurs during the submission process,
 *   such as a network or unexpected runtime error.
 *
 * `setError(genericErrorText)`
 * → Displays a generic error message to the user.
 *
 * `setSucces(false)`
 * → Marks the submission as unsuccessful, ensuring the success state
 *   is not displayed.
 *
 * `resetCaptcha()`
 * → Clears the stored FriendlyCaptcha solution and resets the widget.
 * → Ensures the next submission uses a new captcha solution.
 */
catch {
  setError(genericErrorText);
  setSucces(false);
  resetCaptcha();
}
```

**Rationale:**

FriendlyCaptcha response tokens are single use. After any unsuccessful submission, the existing token is no longer valid, so the widget must be reset to generate a new challenge before the user can submit the form again.

**Previous functionality restriction:**

After a failed submission, the previously solved captcha remained active even though its response token could no longer be reused, preventing successful resubmission.

---

## ✅ Added `resetCaptcha` to the dependency array

**Replaced:**

```ts
}, [form, formValues, captchaSolution, genericErrorText, alreadySignedUpErrorText]);
```

**With:**

```ts
/*
 * Dependency array (`[ ... ]`)
 * → Lists every value referenced inside the callback that may change
 *   between component re-renders.
 *
 * `form`
 * → Recreates the callback if the form instance changes.
 *
 * `formValues`
 * → Recreates the callback if the current form values change.
 *
 * `captchaSolution`
 * → Recreates the callback if the stored FriendlyCaptcha solution
 *   changes.
 *
 * `genericErrorText`
 * → Recreates the callback if the configured generic error message
 *   changes.
 *
 * `alreadySignedUpErrorText`
 * → Recreates the callback if the configured "already signed up"
 *   message changes.
 *
 * `resetCaptcha`
 * → Recreates the callback if the `resetCaptcha` function reference
 *   changes.
 * → Since `resetCaptcha` is memoised with `useCallback(..., [])`,
 *   its function reference remains stable across component re-renders.
 */
}, [
  form,
  formValues,
  captchaSolution,
  genericErrorText,
  alreadySignedUpErrorText,
  resetCaptcha,
]);
```

**Rationale:**

Including `resetCaptcha` satisfies the React Hooks dependency rules and ensures the callback always references the current implementation.

**Previous functionality restriction:**

The callback referenced `resetCaptcha` without declaring it as a dependency.

---

## ✅ Cleared the stored captcha solution on widget errors

**Updated:**

```ts
/*
 * `useCallback((error: WidgetErrorData) => { ... }, [])`
 * → Creates a memoised callback whose reference remains stable
 *   between component re-renders.
 *
 * First argument (`(error: WidgetErrorData) => { ... }`)
 * → The callback function executed when the `FriendlyCaptcha`
 *   widget reports an error.
 *
 * `error: WidgetErrorData`
 * → The error information supplied by the `FriendlyCaptcha` widget.
 * → Provides details about the failure, including the error message.
 *
 * `setError(error.detail)`
 * → Displays the error message provided by the `FriendlyCaptcha`
 *   widget to the user.
 *
 * `setCaptchaSolution(undefined)`
 * → Clears the stored FriendlyCaptcha response token.
 * → Prevents an invalid or incomplete captcha solution from being
 *   reused after a widget error.
 *
 * Second argument (`[]`)
 * → An empty dependency array.
 * → The callback is created during the initial render and the same
 *   function reference is reused on subsequent renders.
 */
const onCaptchaError = useCallback((error: WidgetErrorData) => {
  setError(error.detail);
  setCaptchaSolution(undefined);
}, []);
```

**Rationale:**

If the captcha widget reports an error, the stored solution is no longer valid and should be discarded.

**Previous functionality restriction:**

An invalid captcha solution could remain stored after a widget error.

---

## ✅ Cleared the stored captcha solution when the captcha expired

**Updated:**

```ts
/*
 * `useCallback(() => { ... }, [])`
 * → Creates a memoised callback whose reference remains stable
 *   between component re-renders.
 *
 * First argument (`() => { ... }`)
 * → The callback function executed when the `FriendlyCaptcha`
 *   widget reports that the current captcha has expired.
 *
 * `setError('Captcha expired')`
 * → Displays a message informing the user that the current captcha
 *   challenge has expired.
 *
 * `setCaptchaSolution(undefined)`
 * → Clears the stored FriendlyCaptcha response token.
 * → Prevents an expired single-use captcha solution from being
 *   reused on the next submission attempt.
 *
 * Second argument (`[]`)
 * → An empty dependency array.
 * → The callback is created during the initial render and the same
 *   function reference is reused on subsequent renders.
 */
const onCaptchaExpire = useCallback(() => {
  setError('Captcha expired');
  setCaptchaSolution(undefined);
}, []);
```

### FriendlyCaptcha token flow

```text
1. User completes the captcha
  ↓
2. FriendlyCaptcha generates a unique response token
  ↓
3. The application stores the token in `captchaSolution`
  ↓
4. The token is sent to the server when the form is submitted
  ↓
5. The server asks FriendlyCaptcha:
   "Is this token valid?"
  ↓
6. FriendlyCaptcha confirms whether the token is valid
```

**Rationale:**

Once the captcha expires, its response token is no longer valid. Clearing the stored solution prevents the expired token from being reused in a subsequent submission.

**Previous functionality restriction:**

An expired captcha solution could remain stored after the widget expired.

---

## ✅ Passed the forwarded ref to `FriendlyCaptchaWidget`

**Updated:**

```ts
/*
 * `<FriendlyCaptchaWidget`
 * → Renders the `FriendlyCaptcha` component responsible for
 *   displaying and managing the captcha widget.
 *
 * `ref={captchaWidgetRef}`
 * → Passes the component reference created by `useRef()` to the
 *   `FriendlyCaptcha` component.
 * → React assigns the object exposed via `useImperativeHandle()`
 *   to `captchaWidgetRef.current` once the component is mounted.
 * → Allows the parent component to invoke the public `reset()`
 *   method exposed by the `FriendlyCaptcha` component.
 *
 * `sitekey={captcha.siteKey}`
 * → Passes the FriendlyCaptcha site key used to initialise the
 *   captcha widget.
 */
<FriendlyCaptchaWidget
  ref={captchaWidgetRef}
  sitekey={captcha.siteKey}
  ...
/>
```

**Rationale:**

Passing the ref connects `EmailSignup` to the imperative API exposed by `FriendlyCaptcha`, allowing the component to invoke `reset()` when required.

**Previous functionality restriction:**

Although the `FriendlyCaptcha` component exposed a `reset()` method, `EmailSignup` did not supply a ref and therefore could not access it.