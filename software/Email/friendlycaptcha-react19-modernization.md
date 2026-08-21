# React 19 `forwardRef` modernization

## Overview

This document describes the modernization of the `FriendlyCaptcha` component from the legacy `forwardRef()` API to the React 19 ref model.

The update removes the `forwardRef()` wrapper and receives `ref` as a normal prop while preserving the existing `useImperativeHandle()` implementation and runtime behaviour.

No functional changes were made; the update is a React 19 API modernization.

---

## Rationale

React 19 no longer requires function components to be wrapped with `forwardRef()` in order to receive a ref. Instead, `ref` can be received as a normal component prop.

Modernizing the component:

- Aligns the implementation with the React 19.
- Removes reliance on `forwardRef()`, which remains supported in React 19 but is scheduled for deprecation in a future React release.
- Preserves the existing imperative `reset()` API exposed to the parent component.

**ref path through the code** for the FriendlyCaptcha failed-submit:

1. **Parent creates the ref**  
   **File:** `packages/design-system/src/molecules/EmailSignup/index.tsx`

```ts
/*
 * Mental note:
 * myRef = useRef<useThisType or useNull>(but start as null)
*/
const captchaWidgetRef = useRef<FriendlyCaptchaHandle | null>(null);
```

`EmailSignup` creates a ref whose `.current` can hold the public API exposed by `FriendlyCaptcha`.

2. **Parent passes the ref to FriendlyCaptcha**  
   **File:** `packages/design-system/src/molecules/EmailSignup/index.tsx`

```tsx
<FriendlyCaptchaWidget
  ref={captchaWidgetRef}
  sitekey={captcha.siteKey}
  onComplete={onCaptchaSolved}
  onError={onCaptchaError}
  onExpire={onCaptchaExpire}
/>
```

This connects the parent’s `captchaWidgetRef` to the child `FriendlyCaptcha` component.

3. **FriendlyCaptcha defines the public ref API**  
   **File:** `packages/design-system/src/internal/Captcha/index.tsx`

```ts
export type FriendlyCaptchaHandle = {
  reset: () => void;
};
```

This deliberately limits what the parent can call through the ref to:

```ts
reset()
```

4. **FriendlyCaptcha receives the ref and exposes `reset()`**  
   **File:** `packages/design-system/src/internal/Captcha/index.tsx`

```ts
useImperativeHandle(ref, () => ({
  reset: () => {
    widgetRef.current?.reset();
  },
}));
```

`useImperativeHandle()` effectively makes:

```ts
captchaWidgetRef.current
```

look like:

```ts
{
  reset: () => ...
}
```

to `EmailSignup`.

5. **FriendlyCaptcha stores the real SDK widget instance**  
   **File:** `packages/design-system/src/internal/Captcha/index.tsx`

```ts
const widgetRef = useRef<
  ReturnType<FriendlyCaptchaSDK['createWidget']> | null
>(null);
```

The SDK creates the actual widget:

```ts
const captcha = sdk.createWidget({
  element: captchaRef.current,
  sitekey,
  theme: 'auto',
  ...restProps,
});

widgetRef.current = captcha;
```

So `widgetRef.current` points to the real FriendlyCaptcha SDK widget.

6. **Failed submission triggers the parent reset helper**  
   **File:** `packages/design-system/src/molecules/EmailSignup/index.tsx`

```ts
const resetCaptcha = useCallback(() => {
  setCaptchaSolution(undefined);
  captchaWidgetRef.current?.reset();
}, []);
```

This does two things:

```text
clear stored captcha token
        ↓
call FriendlyCaptcha.reset()
```

7. **The ref call reaches the SDK widget**

The complete chain is:

```text
EmailSignup
packages/design-system/src/molecules/EmailSignup/index.tsx
        ↓
captchaWidgetRef.current?.reset()
        ↓
FriendlyCaptcha public API
packages/design-system/src/internal/Captcha/index.tsx
        ↓
useImperativeHandle(...)
        ↓
widgetRef.current?.reset()
        ↓
FriendlyCaptcha SDK widget
        ↓
fresh captcha challenge
```

So the key distinction is:

```text
captchaWidgetRef
```

= **parent → FriendlyCaptcha component**

while:

```text
widgetRef
```

= **FriendlyCaptcha component → actual SDK widget**

The ref work bridges those two layers so `EmailSignup` can reset the underlying captcha widget without being given direct access to the full FriendlyCaptcha SDK API.

- Requires no behavioural changes to the captcha lifecycle or failed-submit handling.

---

## Legacy functionality restrictions

The legacy implementation relied on `forwardRef()` to expose the component's imperative API.

This introduced:

- An additional wrapper around the component.
- A requirement to assign `FriendlyCaptcha.displayName` to improve React DevTools display.
- A component declaration specific to the legacy ref forwarding model.

The modern implementation removes these structural requirements while preserving identical runtime behaviour.

---

## 1. Import

### Legacy

```ts
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
```

### Modern

```ts
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
```

**Rationale:**

The component no longer depends on the legacy `forwardRef()` API. Removing the `forwardRef` import and introducing the `Ref` type supports the React 19 ref model while preserving the existing imperative API.

**Previous legacy functionality restriction:**

The component depended on the `forwardRef` import in order to receive a forwarded ref. Without importing `forwardRef`, the component could not expose its imperative API to the parent.


---

## 2. Props

### Legacy

```ts
type Props = Omit<CreateWidgetOptions, 'element'> & {
  onComplete?: (response: string) => void;
  onError?: (error: WidgetErrorData) => void;
  onExpire?: () => void;
  className?: string;
};
```

### Modern

```ts
type Props = Omit<CreateWidgetOptions, 'element'> & {
  ref?: Ref<FriendlyCaptchaHandle>;
  onComplete?: (response: string) => void;
  onError?: (error: WidgetErrorData) => void;
  onExpire?: () => void;
  className?: string;
};
```


**Rationale:**

The component now receives `ref` as a standard React prop. Typing the prop as `Ref<FriendlyCaptchaHandle>` preserves the existing imperative API while adopting the React 19 ref model.

**Previous legacy functionality restriction:**

The component props could not include `ref`. Instead, the ref had to be supplied separately through the `forwardRef()` wrapper.


---

## 3. Component declaration

### Legacy

```ts
const FriendlyCaptcha = forwardRef<FriendlyCaptchaHandle, Props>(
  ({ onComplete, onError, onExpire, sitekey, className, ...restProps }, ref) => {
```

### Modern

```ts
const FriendlyCaptcha = ({
  ref,
  onComplete,
  onError,
  onExpire,
  sitekey,
  className,
  ...restProps,
}: Props) => {
```

**Rationale:**

The component is now declared as a standard function component. Receiving `ref` alongside the other props removes the need for the `forwardRef()` wrapper while preserving the existing `useImperativeHandle()` implementation.

**Previous legacy functionality restriction:**

The component declaration depended on `forwardRef()` to receive the parent ref, requiring an additional wrapper around the function component.

---
## 4. Component closing

### Legacy

```ts
  },
);
```

### Modern

```ts
};
```

**Rationale:**

The component is now declared as a standard function component. Receiving `ref` alongside the other props removes the need for the `forwardRef()` wrapper while preserving the existing `useImperativeHandle()` implementation.

**Previous legacy functionality restriction:**

The component declaration depended on `forwardRef()` to receive the parent ref, requiring an additional wrapper around the function component.

---
## 5. Display name

### Legacy

```ts
FriendlyCaptcha.displayName = 'FriendlyCaptcha';
```

### Modern

Removed.

The component is now a normal named function component, so the `displayName` assignment is no longer required.

**Rationale:**

The component is now a standard named function component, so React can determine its name without an explicit `displayName` assignment.

**Previous legacy functionality restriction:**

Components wrapped with `forwardRef()` could appear as `ForwardRef` or anonymous in React DevTools without an explicit `displayName`, making them more difficult to identify during debugging.

---

## Unchanged

The imperative API remains unchanged.

```ts
useImperativeHandle(ref, () => ({
  reset: () => {
    widgetRef.current?.reset();
  },
}));
```

The parent component continues to use:

```ts
const captchaWidgetRef = useRef<FriendlyCaptchaHandle | null>(null);
```

and

```tsx
<FriendlyCaptchaWidget ref={captchaWidgetRef} />
```

No changes were required to the failed-submit logic or the `resetCaptcha()` implementation.