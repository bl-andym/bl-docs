### Assessment: Two systems that appear to be one.

The Button component uses **two independent mechanisms** to express "disabled," but the SCSS only guards hover against **one** of them; the core mismatch.

The mismatch is visible directly in the selected DOM and compiled CSS.

**The selected control is rendered as an anchor**:

```html
<a
  class="...button ...buttonSmall ...outline"
  target="_self"
  href="/visit/yorkshire"
>
```

It is **not** rendered as:

```html
<button disabled>
```

The compiled hover selector is:

```css
.outline:not([disabled]):hover,
.outline:not([disabled]):active,
.outline:not([disabled]):focus-visible {
  // why would we want a reduced optacity on btns or a element text at all?
  opacity: 0.5; 
}
```

Because the selected `<a>` has no `disabled` attribute, this condition is true:

```css
:not([disabled])
```

Therefore the hover rule applies, as shown by the checked `:hover` state in DevTools.

---
### The two mechanisms:

**Mechanism A: CSS class `.disabled`**

Applied in React whenever `disabled={true}`:

```ts
// 40:40:packages/design-system/src/atoms/Button/index.tsx

disabled && styles.disabled,
```

This only affects **appearance**: `opacity: 0.5` and `cursor: not-allowed`. It does not stop clicks, keyboard activation, or navigation. It's paint-only.

---

**Mechanism B: HTML `disabled` attribute**

Only set on the `<button>` path:

```ts
// 64:64:packages/design-system/src/atoms/Button/index.tsx

<button {...buttonProps} className={buttonClass} onClick={onClick} disabled={disabled}>
```

This is **behavioural**. The browser blocks interaction, removes it from the tab order (in most cases), and assistive tech announces "disabled."

The link path never gets this, `<a>` elements don't support `disabled` in HTML, and `disabled` isn't passed to `DsLink` anyway.

---

**The hover guard only watches Mechanism B**

Every variant's hover styles go through `onButtonHover`:

``` css
// 18:23:packages/css-variables/src/utils.scss

@mixin onButtonHover {
  &:not([disabled]):hover,
  &:not([disabled]):active,
  &:not([disabled]):focus-visible {
    @content;
  }
}
```

`:not([disabled])` means: "only apply hover/focus/active styles if this element **does not have a `disabled` attribute in the HTML**."

It says nothing about `.disabled`. The class and the attribute are completely separate in CSS's eyes.

---
## Button disabled state: button vs link

| Variant                              | `.disabled` class | `[disabled]` attribute | Hover blocked by `:not([disabled])`? | Clicks blocked? |
| ------------------------------------ | ----------------- | ---------------------- | ------------------------------------ | --------------- |
| `<button disabled>`                  | Yes               | Yes                    | Yes                                  | Yes             |
| `<a class="disabled">` (link Button) | Yes               | No                     | No                                   | No              

---
### Walk through the table with concrete DOM

#### Row 1: `<button disabled>` — works as intended

```tsx
<Button label="Submit" disabled onClick={handleSubmit} />
```

Renders roughly as:

```html
<button disabled class="button primary disabled">
  Submit
</button>
```

When the user hovers:

1. `.disabled` applies → opacity 0.5
2. Hover rule is `.primary:not([disabled]):hover` → **does not match** because `[disabled]` is present
3. Background stays at default; no hover colour change

**Result:** looks disabled, can't be clicked, no hover feedback. Coherent.

---

#### Row 2: `<a class="disabled">` — the mismatch

```tsx
<Button label="Learn more" variant="outline" disabled link={{ href: '/about' }} />
```

Renders roughly as:

```html
<a href="/about" class="button outline disabled">
  Learn more
</a>
```

**Missing**: there is no `disabled` attribute. Links can't have one, and the component doesn't add `aria-disabled="true"` either.

When the user hovers:

1. `.disabled` applies → opacity 0.5
2. Hover rule is `.outline:not([disabled]):hover` → **does match**, because there is no `[disabled]` attribute
3. Hover sets `opacity: 0.5` again (same value, so visually unchanged for outline/textOnly)

For **primary/secondary/tertiary link buttons**, it's worse — the hover background and shadow **do** change, because those variants use real colour changes, not opacity:

```css
  // 40:43:packages/design-system/src/atoms/Button/Button.module.scss
  
  @include utils.onButtonHover {
    background-color: var(--surface-primary-hover);
    box-shadow: var(--shadow-dark);
  }
```

So a "disabled" primary link button would:

- have `.disabled` fading it to 50% opacity
- **and** get a hover background colour change on mouseover
- **and** still navigate when clicked (it's a live `<a href="...">`)

That's three layers of wrong: visual confusion, false affordance, and functional when it shouldn't be.

---

### Why this is easy to miss

From the React side, both paths look identical:

```tsx
disabled && styles.disabled   // always applied
```

So you'd assume `disabled={true}` behaves the same whether it's a button or a link. It doesn't — the **behavioural** half of disabled only exists on the button path.

The SCSS was written with `<button>` in mind. `:not([disabled])` is a standard, correct pattern for native buttons. The link variant was added later (or never fully accounted for), and `.disabled` was treated as sufficient for both — but a CSS class can't substitute for what `[disabled]` does in the browser.

---

### Visual summary

```text
disabled={true}
       │
       ├── <button> path
       │     ├── .disabled class     → opacity 0.5, cursor
       │     ├── [disabled] attr     → no clicks, no focus, a11y
       │     └── :not([disabled])    → hover BLOCKED ✓
       │
       └── <a> link path
             ├── .disabled class     → opacity 0.5, cursor
             ├── [disabled] attr     → MISSING ✗
             └── :not([disabled])    → hover STILL FIRES ✗
                                         clicks STILL WORK ✗
```

---

### Bottom line

The mismatch isn't a subtle CSS quirk — it's a **split contract**:

| Concern | Button path | Link path |
|---|---|---|
| Looks disabled | yes (`.disabled`) | yes (`.disabled`) |
| Actually disabled | yes (`disabled` attr) | **no** |
| Hover suppressed | yes (`:not([disabled])`) | **no** |
| Click suppressed | yes (browser) | **no** (navigates) |

The table looks like a small styling inconsistency, but for link buttons `disabled={true}` is **cosmetic only**. The user sees a greyed-out control that still reacts to hover and still navigates — which is the opposite of what "disabled" should mean.

To fix it properly we'd need all three layers aligned on the link path: block interaction in JS/`DsLink`, expose state to assistive tech (`aria-disabled="true"`, `tabIndex={-1}`), and extend the SCSS guard to something like `:not([disabled]):not(.disabled):not([aria-disabled="true"])`.
