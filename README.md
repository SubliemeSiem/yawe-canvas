# yawe-canvas

## Table of Contents

- [1. Usage](#1.-usage)
    - [1.1 Creating the element](#1.1-creating-the-element)
    - [1.2 Adding Custom Toolbar Elements](#1.2-adding-custom-toolbar-elements)
- [2. Properties (comming soon)](#2.-properties)
- [3. Methods](#3.-methods)

---

## 1. Usage 

### 1.1 Creating the Element

Simply include the editor.js file and use the html element on your page like so:
```HTML
<script type="module" src="yawe-editor.js"></script>
<yawe-canvas></yawe-canvas>
```
Since we define a new element in the DOM, we will need to wait until it is defined to start using it's properties and methods:
```javascript
customElements.whenDefined('yawe-canvas').then(() => {
    // your code
});
```

[Return to Table of Contents](#table-of-contents)

### 1.2 Adding Custom Toolbar Elements

You can add custom toolbar elements by placing them in the yawe editor's body and specifying that it goes into the `toolbar-button` slot like so:
```HTML
<yawe-canvas id="yawe-canvas">
    <div slot="toolbar-button"><b>B</b></div>
    <div slot="toolbar-button"><i>I</i></div>
    <div slot="toolbar-button"><u>U</u></div>
</yawe-canvas>
```
These elements can be styled using css.

[Return to Table of Contents](#table-of-contents)

---

## 2. Properties

The yawe-canvas exposes the following properties:

| Property | Description | Type | Example | Default |
|:---------|:-----------:|:----:|:-------:|--------:|
| font | The font | string | "serif" | "serif" |
| fontSize | The size of the font | number | 20 | 20 |
| lineHeight | The height of a line | number | 24 |  1.2 * fontSize |
| tabIndex | The tab index | number | -1 | 0 |
| blinkInterval | Interval between cursor blinks | number | 500 | 500 |
| color | Font color | string | "#17200A" | "#000000" |
| backgroundColor | Background color | string | "#9F2A8B" | "#FFFFFF" |
| selectionColors | Font color for selection;<br> Font color for selection when blurred | string | #000000;#121212 | #FFFFFF;#FFFFFF |
| selectionBackgroundColors | Background color for selection;<br>Background color for selection when blurred | string | #964442;#885567 | #2156DE;#2156DE |

Setting a property to `undefined` will revert it to it's default.


[Return to Table of Contents](#table-of-contents)

---

## 3. Methods

The yawe-canvas exposes the following methods:
- `updateCanvas()`: Render either the entire or part of the canvas. Usage:
    - `updateCanvas`: Render the entire canvas
    - `updateCanvas(x, y, width, height)`: Render a part of the canvas from `(x, y)` to `(x + width, y + height)`.
- `checkAndSet`: Check a `value` and use it to set a given `attribute` in one of four ways:
    - `checkAndSet(attribute)`: removes the given `attribute` and uses it's default value.
    - `checkAndSet(attribute, value)`: assigns `value` to `attribute`.
    - `checkAndSet(attribute, value, check)`: assigns `value` to `attribute` if `check` is true. `check` can be a boolean or a function, in which case `check(value)` is evaluated.
    - `checkAndSet(attribute, value, check, error)`: assigns `value` to `attribute` if `check` is true. `check` can be a boolean or a function, in which case `check(value)` is evaluated. If `check` is false a `new Error(error)` is thrown.
    - Examples: 
        ```HTML
        <yawe-canvas id="yawe-canvas"></yawe-canvas>
        <script>
        customElements.whenDefined('yawe-canvas').then(() => {
            const yaweCanvas = document.getElementById('yawe-canvas');
            // remove tab index
            yaweCanvas.checkAndSet('tabindex');
            // set width to 500px
            yaweCanvas.checkAndSet('width', 500);
            // set height to 'value' if value is greater than 0
            yaweCanvas.checkAndSet('height', value, x => x > 0);
            // set height to 'value' if value is greater than 0 or throw an error
            yaweCanvas.checkAndSet('height', value, x => x > 0, 'Height must be greater than 0');
        });
        </script>
        ```
[Return to Table of Contents](#table-of-contents)

---

## TODO

- [X] Implement Web Component
- [X] Implement Shadow DOM
- [X] Implement TextBlock
- [X] Implement Line
- [X] Implement rendering of a TextBlock
- [ ] Implement single char widths cache
    - [X] Implement FontWidths class
    - [ ] Inject class into textblock objects
- [ ] Implement wrapping of words
- [ ] Implement keyboard Events
- [ ] Implement styling (bold / italic /underline)
- [ ] Implement partial repaint
- [ ] Expose method for HTML result
- [ ] Expose method for text result
