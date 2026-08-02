# File: `design-systems/src/internal/captcha/index`

## Objective:

Enhance the email signup flow to correctly handle single-use FriendlyCaptcha tokens by exposing a reset API from the `FriendlyCaptcha` component so parent components can regenerate the widget after unsuccessful submissions.

## Change index:

- Replaced FC with forwardRef
- Added the exported `FriendlyCaptchaHandle` type exposing `reset()`
- Added `widgetRef` to retain the `createWidget()` widget instance
- Exposed `reset()` via `useImperativeHandle()`
- Stored the widget instance returned by `createWidget()`
- Updated cleanup to destroy the widget and clear the reference
- Added `FriendlyCaptcha.displayName`

---

**Note**: Code comments only appear in this documentation and not in the source code.

## ✅ Replaced FC with forwardRef


**Replaced:**

``` ts
/*
 * `import type { FC } from 'react'`
 * → Imports React's `FunctionComponent` (`FC`) type.
 * → `FC` defines the component as a standard functional component
 *   that accepts props but does not support receiving a forwarded ref.
 *
 * `useEffect`
 * → Performs setup and cleanup of the FriendlyCaptcha widget.
 *
 * `useRef`
 * → Stores a mutable reference to the FriendlyCaptcha widget instance.
 *
 * `const FriendlyCaptcha: FC<Props>`
 * → Declares `FriendlyCaptcha` as a functional component accepting
 *   `Props`.
 * → Because the component is typed as an `FC`, a parent component
 *   cannot pass a React ref to it.
 * → This prevents the component from exposing a public `reset()`
 *   method via `forwardRef()` and `useImperativeHandle()`.
 */
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

const FriendlyCaptcha: FC<Props> = (...) => {
```

**With:**

``` ts
/*
 * React hooks used to manage the `FriendlyCaptcha` component.
 *
 * `forwardRef`
 * → Allows a parent component to pass a ref to this component.
 *
 * `useEffect`
 * → Performs setup and cleanup of the FriendlyCaptcha widget.
 *
 * `useImperativeHandle`
 * → Exposes the component's public `reset()` method through the ref.
 *
 * `useRef`
 * → Stores a mutable reference to the FriendlyCaptcha widget instance.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/*
 * `forwardRef<FriendlyCaptchaHandle, Props>(...)`
 * → Wraps the functional component so it can receive a forwarded
 *   React ref from its parent component.
 *
 * `forwardRef` is a generic React function.
 * → It accepts type arguments that tell TypeScript:
 *   - the type of the forwarded ref
 *   - the type of the component props
 *
 * Type argument 1 (`FriendlyCaptchaHandle`)
 * → Defines the type of the forwarded ref.
 * → Specifies the public methods exposed through the ref.
 * → In this component, the parent can invoke:
 *
 *   captchaWidgetRef.current?.reset();
 *
 * Type argument 2 (`Props`)
 * → Defines the props accepted by the `FriendlyCaptcha` component.
 *
 * `(...) => { ... }`
 * → The component implementation receives both the component props
 *   and the forwarded ref.
 * → `useImperativeHandle()` later assigns the public API to this ref.
 */
const FriendlyCaptcha = forwardRef<FriendlyCaptchaHandle, Props>(
  (...) => {
```

**Rationale:**

The component needs to expose a `reset()` method to its parent. Functional components (`FC`) cannot receive refs by default. `forwardRef` enables the component to receive a forwarded ref, which `useImperativeHandle()` then uses to expose an explicitly defined imperative API.

> **In React, _imperative_ means:**
>
> > **"Do this now."**
>
> as opposed to **declarative**, which means:
>
> > **"Describe what you want, and React decides how to do it."**

**Previous functionality restriction:**

The component was declared as an `FC`, so the parent `EmailSignup` component had no mechanism to access or invoke methods on the `FriendlyCaptcha` component.

------------------------------------------------------------------------

## ✅ Added the exported `FriendlyCaptchaHandle` type exposing `reset()`

**Added:**

``` ts
export type FriendlyCaptchaHandle = {
  /* 
  * reset(): Performs an action and does not return a value. 
  * Therefore, `void` is the appropriate return type. 
  */
  reset: () => void;
};
```

**Rationale:**

The parent `EmailSignup` component needs a controlled way to reset the FriendlyCaptcha widget after a failed submission. Exposing a minimal interface containing only `reset()` allows the parent to invoke the reset operation without exposing the underlying SDK widget or its full
API.

**Previous functionality restriction:**

No public interface existed, so the parent component had no supported mechanism to reset the widget after a failed submission.

------------------------------------------------------------------------

## ✅ Added `widgetRef` to retain the `createWidget()` widget instance

**Added:**

``` ts
/*
* useRef<
*   What type of value will be stored?
*       ReturnType<
*           What type does FriendlyCaptchaSDK.createWidget() return?
*       > | null
* >
*
*
* Outer generic (`useRef<...>`)
* → "What type of value will be stored?"
* → The value returned by FriendlyCaptchaSDK.createWidget(), or null.
*
* Inner generic (`ReturnType<...>`)
* → "What type does this function return?"
* → The FriendlyCaptcha widget instance.
*/
const widgetRef = useRef<
  ReturnType<FriendlyCaptchaSDK['createWidget']> | null
>(null);
```

**Rationale:**

The FriendlyCaptcha SDK returns a widget instance from `createWidget()`. Retaining a reference to this instance enables later calls to `reset()` and `destroy()` after the widget has been created.

`ReturnType<FriendlyCaptchaSDK['createWidget']>` infers the widget instance type directly from the SDK's public `createWidget()` method, avoiding the need to import the non-exported `WidgetHandle` type.

**Previous functionality restriction:**

The widget instance was only available as a local variable within `useEffect()`, making it inaccessible once widget creation had completed. `WidgetHandle` is not exported by `@friendlycaptcha/sdk`, so attempting to import it would also result in a TypeScript compilation error.

------------------------------------------------------------------------

## ✅ Exposed `reset()` via `useImperativeHandle()`

**Added:**

``` ts
/*
 * First argument (`ref`)
 * → The React ref passed to `FriendlyCaptcha` by the `EmailSignup` component.
 * → `useImperativeHandle()` assigns the exposed methods to this ref,
 *   allowing `EmailSignup` to call:
 *
 *   captchaWidgetRef.current?.reset();
 *
 * Second argument (`() => ({ ... })`)
 * → The methods that will be exposed through the ref.
 * → An object exposing a single `reset()` method.
 *
 * `reset()`
 * → The method the parent component can invoke.
 * → Calls the FriendlyCaptcha widget's `reset()` method.
 *
 * `widgetRef.current?.reset()`
 * → Calls `reset()` on the current FriendlyCaptcha widget instance,
 *   if one exists.
 *
 * Optional chaining (`?.`)
 * → Prevents `reset()` from being called when `widgetRef.current`
 *   is `null`, avoiding a runtime error.
 */
useImperativeHandle(ref, () => ({
  reset: () => {
    widgetRef.current?.reset();
  },
}));
```

**Rationale:**

`useImperativeHandle()` defines the public API exposed through the forwarded ref. Rather than exposing the entire FriendlyCaptcha widget, it limits access to the single operation required by the parent component: resetting the widget after a failed submission.

**Previous functionality restriction:**

The forwarded ref did not expose any functionality, leaving the parent component unable to invoke a widget reset.

------------------------------------------------------------------------

## ✅ Stored the widget instance returned by `createWidget()`

**Added:**

``` ts
/*
 * `sdk.createWidget({ ... })`
 * → Calls the `createWidget()` method provided by the FriendlyCaptcha SDK.
 * → `sdk.` prefixes the method because `createWidget()` belongs to the
 *   instantiated SDK object, not to the component itself.
 *
 * `const captcha`
 * → Stores the widget instance returned by `createWidget()`.
 * → This instance provides methods such as `reset()` and `destroy()`.
 *
 * `widgetRef.current = captcha`
 * → Stores the widget instance in the React ref.
 * → This makes the widget available outside of `useEffect()`,
 *   allowing other functions (such as `reset()`) to access it
 *   after the widget has been created.
 */
const captcha = sdk.createWidget({
  ...
});

widgetRef.current = captcha;
```

**Rationale:**

Storing the widget instance in `widgetRef.current` allows subsequent interactions with the same widget, including calling `reset()` after failed submissions and `destroy()` during component cleanup.

**Previous functionality restriction:**

The widget instance was discarded after creation and therefore could not be referenced outside the initial `useEffect()` execution.

------------------------------------------------------------------------

## ✅ Updated cleanup to destroy the widget and clear the reference

**Replaced:**

``` ts
return () => captcha?.destroy();
```

**With:**

``` ts
/*
 * `return () => { ... }`
 * → Returns a cleanup function from `useEffect()`.
 * → React automatically calls this function when the component
 *   unmounts or before the effect runs again.
 *
 * `widgetRef.current?.destroy()`
 * → Calls the FriendlyCaptcha widget's `destroy()` method,
 *   if the current widget instance exists.
 *
 * Optional chaining (`?.`)
 * → Prevents `destroy()` from being called when
 *   `widgetRef.current` is `null`, avoiding a runtime error.
 *
 * `widgetRef.current = null`
 * → Clears the stored widget reference after destruction.
 * → Prevents the component from retaining a reference to a
 *   widget instance that is no longer valid.
 */
return () => {
  widgetRef.current?.destroy();
  widgetRef.current = null;
};
```

**Rationale:**

Destroying the widget releases the resources associated with it when the component unmounts. Clearing the stored reference ensures the component no longer retains a reference to a destroyed widget instance.

**Previous functionality restriction:**

The widget was destroyed during cleanup, but any persistent reference would continue to point to an invalid widget instance after destruction.

------------------------------------------------------------------------

## ✅ Added `FriendlyCaptcha.displayName`

**Added:**

``` ts
FriendlyCaptcha.displayName = 'FriendlyCaptcha';
```

**Rationale:**

Components created with `forwardRef()` can appear as `ForwardRef` or anonymous in React DevTools. Setting `displayName` preserves a meaningful component name, making debugging and component inspection clearer.

**Previous functionality restriction:**

Without a `displayName`, the component could appear as `ForwardRef` or anonymous in React DevTools, making it more difficult to identify during debugging.
