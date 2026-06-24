# DOM Debugging Commands

```js
document.querySelector('footer')
// Returns the first <footer> element in the document.
```

```js
getComputedStyle(document.querySelector('footer'))
  .backgroundColor
// Returns the computed background colour of the footer element.
```

```js
getComputedStyle(document.documentElement)
  .getPropertyValue('--surface-navigation')
// Returns the value of the CSS custom property --surface-navigation from :root.
```

```js
document.elementFromPoint(
  window.innerWidth / 2,
  window.innerHeight - 50
)
// Returns the element located at the specified screen coordinates.
```

## Additional Useful Commands

```js
document.querySelector('.footer')
// Returns the first element with the class 'footer'.
```

```js
getComputedStyle(document.querySelector('.footer'))
// Returns all computed CSS styles for the footer element.
```

```js
getComputedStyle(document.body)
  .backgroundColor
// Returns the computed background colour of the body element.
```

```js
getComputedStyle(document.documentElement)
  .backgroundColor
// Returns the computed background colour of the html element.
```

```js
document.querySelector('link[rel="icon"]')
// Returns the favicon link element from the document head.
```

```js
document.querySelector('link[rel="icon"]').href
// Returns the URL currently being used as the favicon.
```
