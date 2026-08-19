There are **two separate contrast calculations**: light mode and dark mode.

For text, including placeholder text, the **target contrast** is:

```
Normal text: minimum 4.5:1
Large text: minimum 3:1
```

WCAG contrast ratio formula:

```
Contrast = (Llighter + 0.05) / (Ldarker + 0.05)
```

Where:

```
Llighter = relative luminance of the lighter colour
Ldarker  = relative luminance of the darker colour
```

---

## WCAG contrast ratio formula in action for input placeholder text in the BIPC theme

### Light mode

```css
--color-text-primary-ghosted: rgb(from #{$gray-6} r g b / 0.78);

// 0.78 is the foreground at 78% opapcity. Therefore the remaining 22% of the visible colour comes from the background: (1 - 0.78) = 0.22
```

Values:

```
Foreground: #383833 ($gray-6) = rgb(56, 56, 51)

Alpha:      0.78

Background: #e8e6dc ($gray-2) = rgb(232, 230, 220)
```

First composite the translucent foreground:

```
// 0.22 is the remaining 22% of the visible colour coming from the background.

R = (56 × 0.78) + (232 × 0.22) = 94.72 

G = (56 × 0.78) + (230 × 0.22) = 94.28

B = (51 × 0.78) + (220 × 0.22) = 88.18

Effective colour ≈ rgb(95, 94, 88)
```

Convert the effective foreground RGB to linear RGB:

```
rgb(95, 94, 88) → linear RGB ≈ (0.114, 0.112, 0.098)
```

Fixed coefficients defined by the WCAG relative-luminance formula:

```
0.2126 = Red luminance weighting
0.7152 = Green luminance weighting
0.0722 = Blue luminance weighting
```

Calculate foreground relative luminance using the above coefficients:

```
Lforeground = (0.2126 × 0.114)
            + (0.7152 × 0.112)
            + (0.0722 × 0.098)
            ≈ 0.111
```

Convert the background RGB to linear RGB:

```
rgb(232, 230, 220) → linear RGB ≈ (0.807, 0.791, 0.716)
```

Calculate background relative luminance using the above coefficients:

```
Lbackground = (0.2126 × 0.807)
            + (0.7152 × 0.791)
            + (0.0722 × 0.716)
            ≈ 0.789
```

Therefore:

```
Llighter = 0.789
Ldarker  ≈ 0.111
```

Apply WCAG:

```
Contrast = (0.789 + 0.05) / (0.111 + 0.05)
         ≈ 5.21:1
```

### Dark mode

```
--color-text-primary-ghosted: rgb(from #{$white} r g b / 0.65);
```

Values:

```
Foreground: #fffbfb = rgb(255, 251, 251)

Alpha:      0.65

Background: #5a5853 = rgb(90, 88, 83)
```

Composite:

```
R = (255 × 0.65) + (90 × 0.35) = 197.25

G = (251 × 0.65) + (88 × 0.35) = 193.95

B = (251 × 0.65) + (83 × 0.35) = 192.20

Effective colour ≈ rgb(197, 194, 192)
```

Convert the effective foreground RGB to linear RGB:

```
rgb(197, 194, 192) → linear RGB ≈ (0.558, 0.539, 0.527)
```

Calculate foreground relative luminance:

```
Lforeground = (0.2126 × 0.558)
            + (0.7152 × 0.539)
            + (0.0722 × 0.527)
            ≈ 0.542
```

Convert the background RGB to linear RGB:

```
rgb(90, 88, 83) → linear RGB ≈ (0.102, 0.098, 0.087)
```

Calculate background relative luminance:

```
Lbackground = (0.2126 × 0.102)
            + (0.7152 × 0.098)
            + (0.0722 × 0.087)
            ≈ 0.098
```

Therefore:

```
Llighter ≈ 0.542
Ldarker  ≈ 0.098
```

Apply WCAG:

```
Contrast = (0.542 + 0.05) / (0.098 + 0.05)
         ≈ 4.00:1
```

So **`L`** **is the relative luminance of each effective colour**; `Llighter` and `Ldarker` are simply whichever of those two luminance values is higher or lower.

---

**BIPC theme scopes**.

Added:
```css
:root {
  --color-text-primary-ghosted: rgb(from #{$gray-6} r g b / 0.78);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary-ghosted: rgb(from #{$white} r g b / 0.65);
  }
}
```


**But inside**:
```css
[data-custom-theme='bipc'] {
  --color-text-primary: #{$dark-blue-1};
  --color-text-primary-hover: #{$dark-blue-3};
  --color-text-primary-fixed: #{$pink-1};
  --color-text-primary-inversed: #{$pink-1};
  --color-text-tertiary: #{$dark-blue-3};
  
  // Missing:
  // --color-text-primary-ghosted: ...;
  // Therefore BIPC light inherits the :root value:
  // rgb(from #{$gray-6} r g b / 0.78)
  
  @media (prefers-color-scheme: dark) {
    --color-text-primary: #{$pink-1};
    --color-text-primary-hover: #{$pink-3};
    --color-text-primary-fixed: #{$dark-blue-1};
    --color-text-primary-inversed: #{$dark-blue-1};
    --color-text-tertiary: #{$pink-1};

    // Missing:
    // --color-text-primary-ghosted: ...;
    // Therefore BIPC dark inherits the dark-mode :root value:
    // rgb(from #{$white} r g b / 0.65)
  }
}
```

Inheritance happens because `--color-text-primary-ghosted` is **not re-declared in either BIPC scope**, causing the standard `:root` values to remain in effect.

---

My calculations suggest in dark-mode the contrast isn't sufficient.

**Suggested change**:

| Original PR                                                        | Suggested                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `--color-text-primary-ghosted: rgb(from #{$gray-6} r g b / 0.78);` | `--color-text-primary-ghosted: rgb(from #{$gray-6} r g b / 0.78);` |
| `--color-text-primary-ghosted: rgb(from #{$white} r g b / 0.65);`  | `--color-text-primary-ghosted: rgb(from #{$white} r g b / 0.72);`  |
| **Dark: `0.65` → ≈ 4.0:1 ❌**                                       | **Dark: `0.72` → ≈ 4.5:1 ✅**                                       |
