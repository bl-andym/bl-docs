# File: `design-systems/src/molecules/emailSignup/index`

## ✅ Replaced FC with forwardRef

**Replaced:**

``` ts
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

const FriendlyCaptcha: FC<Props> = (...) => {
```

**With:**

``` ts
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const FriendlyCaptcha = forwardRef<FriendlyCaptchaHandle, Props>(
  (...) => {
```

**Rationale:**

The component needs to expose a `reset()` method to its parent.
Functional components (`FC`) cannot receive refs by default, whereas
`forwardRef` allows the parent component to access an explicitly defined
imperative API.

**Previous functionality restriction:**

The component was declared as an `FC`, so the parent `EmailSignup`
component had no mechanism to access or invoke methods on the
`FriendlyCaptcha` component.

------------------------------------------------------------------------

## ✅ Added the exported `FriendlyCaptchaHandle` type exposing `reset()`

**Added:**

``` ts
export type FriendlyCaptchaHandle = {
  reset: () => void;
};
```

**Rationale:**

The parent `EmailSignup` component needs a controlled way to reset the
FriendlyCaptcha widget after a failed submission. Exposing a minimal
interface containing only `reset()` allows the parent to invoke the
reset operation without exposing the underlying SDK widget or its full
API.

**Previous functionality restriction:**

No public interface existed, so the parent component had no supported
mechanism to reset the widget after a failed submission.

------------------------------------------------------------------------

## ✅ Added `widgetRef` to retain the `createWidget()` handle

**Added:**

``` ts
const widgetRef = useRef<
  ReturnType<FriendlyCaptchaSDK['createWidget']> | null
>(null);
```

**Rationale:**

The FriendlyCaptcha SDK returns a widget instance from `createWidget()`.
Retaining a reference to this instance enables later calls to `reset()`
and `destroy()` after the widget has been created.

**Previous functionality restriction:**

The widget instance was only available as a local variable within
`useEffect()`, making it inaccessible once widget creation had
completed.

------------------------------------------------------------------------

## ✅ Used `ReturnType<FriendlyCaptchaSDK['createWidget']>` instead of importing the non-exported `WidgetHandle`

**Replaced:**

``` ts
import type { WidgetHandle } from '@friendlycaptcha/sdk';

const widgetRef = useRef<WidgetHandle | null>(null);
```

**With:**

``` ts
const widgetRef = useRef<
  ReturnType<FriendlyCaptchaSDK['createWidget']> | null
>(null);
```

**Rationale:**

Infer the correct widget type directly from the SDK's public
`createWidget()` method, avoiding reliance on SDK implementation
details.

**Previous functionality restriction:**

`WidgetHandle` is not exported by `@friendlycaptcha/sdk`, so attempting
to import it resulted in a TypeScript compilation error.

------------------------------------------------------------------------

## ✅ Exposed `reset()` via `useImperativeHandle()`

**Added:**

``` ts
useImperativeHandle(ref, () => ({
  reset: () => {
    widgetRef.current?.reset();
  },
}));
```

**Rationale:**

`useImperativeHandle()` defines the public API exposed through the
forwarded ref. Rather than exposing the entire FriendlyCaptcha widget,
it limits access to the single operation required by the parent
component: resetting the widget after a failed submission.

**Previous functionality restriction:**

Although a forwarded ref could be introduced, no functionality was
exposed through it, leaving the parent component unable to invoke a
widget reset.

------------------------------------------------------------------------

## ✅ Stored the widget instance returned by `createWidget()`

**Added:**

``` ts
const captcha = sdk.createWidget({
  ...
});

widgetRef.current = captcha;
```

**Rationale:**

Persisting the widget instance allows subsequent interactions with the
same widget, including calling `reset()` after failed submissions and
`destroy()` during component cleanup.

**Previous functionality restriction:**

The widget instance was discarded after creation and therefore could not
be referenced outside the initial `useEffect()` execution.

------------------------------------------------------------------------

## ✅ Updated cleanup to destroy the widget and clear the reference

**Replaced:**

``` ts
return () => captcha?.destroy();
```

**With:**

``` ts
return () => {
  widgetRef.current?.destroy();
  widgetRef.current = null;
};
```

**Rationale:**

Destroying the widget removes its associated resources when the
component unmounts. Clearing the stored reference ensures the component
no longer retains a reference to a destroyed widget instance.

**Previous functionality restriction:**

The widget was destroyed during cleanup, but any persistent reference
would continue to point to an invalid widget instance after destruction.

------------------------------------------------------------------------

## ✅ Added `FriendlyCaptcha.displayName`

**Added:**

``` ts
FriendlyCaptcha.displayName = 'FriendlyCaptcha';
```

**Rationale:**

Components created with `forwardRef` can appear as anonymous in React
DevTools. Setting `displayName` preserves a meaningful component name,
making debugging and component inspection clearer.

**Previous functionality restriction:**

Without a `displayName`, the component could appear as `ForwardRef` or
anonymous in React DevTools, making it more difficult to identify during
debugging.
