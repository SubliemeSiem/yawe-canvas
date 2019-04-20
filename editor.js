import { Line } from "./line.js";

(function() {
    const privates = new class {
        shadowRoot;
        resizeTimeout;
        lines;
        context;
        canvas;
        onconnected = [];
        template = document.createElement('template');
        selection = {
            start: {
                line: 0,
                block: 0,
                char: 0
            },
            end: {
                line: 0,
                block: 0,
                char: 0
            },
            leftToRight: true,
            isCollapsed: () => this.selection.start.line === this.selection.end.line &&
                               this.selection.start.block === this.selection.end.block &&
                               this.selection.start.char === this.selection.end.char
        }

        constructor() {
            this.template.innerHTML = `
            <link href="yawe-canvas.css" rel="stylesheet" type="text/css"> 
            <div class="container">
                <div class="toolbar header">
                    <slot name="toolbar-button"></slot>
                </div>
                <div class="canvas-area">
                    <canvas></canvas>
                </div>
                <div class="toolbar footer">
                    <slot name="footer-button"></slot>
                </div>
            </div>`;
        }
        
        scaleCanvas() {
            this.canvas.style.width = this.canvas.parentElement.clientWidth;
            this.canvas.style.height = this.canvas.parentElement.clientHeight;
            this.canvas.width = this.canvas.clientWidth * (window.devicePixelRatio || 1);
            this.canvas.height = this.canvas.clientHeight * (window.devicePixelRatio || 1);
            this.context = this.canvas.getContext('2d');
            this.context.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }

        onmousedown(event) {}

        onmousemove(event) {}

        onmouseup(event) {}

        oncut(event) {}

        oncopy(event) {}

        onpaste(event) {}

        onkeydown(event) {}
    }();

    window.customElements.define('yawe-canvas', class extends HTMLElement {
        get font() {
            return this.hasAttribute('font') ? this.getAttribute('font') : undefined;
        }

        set font(value) {
            this.checkAndSet(
                'font',
                value,
                x => typeof x === 'string',
                'Invalid font'
            );
        }

        get fontSize() {
            return this.hasAttribute('font-size') ? Number.parseInt(this.getAttribute('font-size')) : undefined;
        }

        set fontSize(value) {
            this.checkAndSet(
                'font-size',
                value,
                x => typeof x === 'number' && x > 0,
                'Invalid font size'
            );
        }

        get lineHeight() {
            return this.hasAttribute('line-height') ? Number.parseInt(this.getAttribute('line-height')) : undefined;
        }

        set lineHeight(value) {
            this.checkAndSet(
                'line-height',
                value,
                x => typeof x === 'number' && x > 0,
                'Invalid line height'
            );
        }

        get tabIndex() {
            return this.hasAttribute('tabindex') ? Number.parseInt(this.getAttribute('tabindex')) : undefined;
        }

        set tabIndex(value) {
            this.checkAndSet(
                'tabindex',
                value,
                x => typeof x === 'number' && x >= -1,
                'Invalid tab index'
            );
        }

        get blinkInterval() {
            return this.hasAttribute('blink-interval') ?
                Number.parseInt(this.getAttribute('blink-interval')) :
                undefined;
        }

        set blinkInterval(value) {
            this.checkAndSet(
                'blink-interval',
                value,
                x => typeof x === 'number' && x > 0,
                'Invalid blink interval'
            );
        }

        get color() {
            return this.hasAttribute('color') ? this.getAttribute('color') : undefined;
        }

        set color(value) {
            this.checkAndSet(
                'color', 
                value, 
                x => typeof x === 'string' && /^#[0-9a-fA-F]{6,8}$/.test(x),
                'Invalid color value');
        }

        get backgroundColor() {
            return this.hasAttribute('background-color') ? this.getAttribute('background-color') : undefined;
        }

        set backgroundColor(value) {
            this.checkAndSet(
                'background-color', 
                value, 
                x => typeof x === 'string' && /^#[0-9a-fA-F]{6,8}$/.test(x),
                'Invalid color value');
        }

        get selectionColors() {
            return this.hasAttribute('selection-color') ? this.getAttribute('selection-color') : undefined;
        }

        set selectionColors(value) {
            this.checkAndSet(
                'selection-background-colors', 
                value, 
                x => typeof x === 'string' && /^#[0-9a-fA-F]{6,8}(;\s?#[0-9a-fA-F]{6,8})?$/.test(x),
                'Invalid color value');
        }

        get selectionBackgroundColors() {
            return this.hasAttribute('background-color') ? this.getAttribute('background-color') : undefined;
        }

        set selectionBackgroundColors(value) {
            this.checkAndSet(
                'selection-background-colors', 
                value, 
                x => typeof x === 'string' && /^#[0-9a-fA-F]{6,8}(;\s?#[0-9a-fA-F]{6,8})?$/.test(x),
                'Invalid color value');
        }

        get onconnected() {
            return privates.onconnected;
        }

        constructor() {
            super();

            privates.shadowRoot = this.attachShadow({mode: 'closed'});
            privates.shadowRoot.appendChild(privates.template.content.cloneNode(true));
        }

        connectedCallback() {
            const canvas = privates.shadowRoot.querySelector('canvas');
            privates.refresh(canvas);

            // initialize all properties that were set before the element was actually created
            Object.keys(this).forEach(property => {
                if (!property.startsWith('_') && this.hasOwnProperty(property)) {
                    let value = this[property];
                    delete this[property];
                    this[property] = value;
                  }
            });

            let lastWidth = canvas.clientWidth;

            // only set the default value if the user hasn't set a value
            if (this.tabIndex === undefined) {
                this.tabIndex = 0;
            }

            // bind events
            this.onfocus = () => {
                privates.cursorVisible = true;
    
                clearInterval(privates.blinkIntervalToken);
                privates.blinkIntervalToken = setInterval(() => {
                    this.updateCanvas();
                    privates.cursorVisible = !privates.cursorVisible;
                }, this.blinkInterval || 500);
            }

            this.onblur = () => {
                privates.cursorVisible = false;
                clearInterval(privates.blinkIntervalToken);
            }

            this.onkeydown = (e) => {};
            this.onmousedown = (e) => {};
            this.onmousemove = (e) => {};
            this.onmouseup = (e) => {};
            this.oncut = (e) => {};
            this.oncopy = (e) => {};
            this.onpaste = (e) => {};

            // initialize text data
            const colors = {};
            if (this.color !== undefined) {
                colors.text = this.color;
            }
            if (this.backgroundColor !== undefined) {
                colors.background = this.backgroundColor;
            }
            if (this.selectionColors !== undefined) {
                colors.selectionText = this.selectionColors.split(';')[0];
                colors.selectionTextBlurred = this.selectionColors.split(';')[0];
            }
            if (this.selectionBackgroundColors !== undefined) {
                colors.selectionBackground = this.selectionBackgroundColors.split(';')[0];
                colors.selectionBackgroundBlurred = this.selectionBackgroundColors.split(';')[1];
            }
            privates.lines = [
                new Line(
                    privates.context,
                    this.font || 'serif',
                    this.fontSize || 20,
                    this.lineHeight || 1.2 * (this.fontSize || 20),
                    undefined,
                    colors,
                    'Hello world!',
                    false)
            ];
            
            // repaint after a resize with 100 ms debounce time
            window.onresize = () => {
                if (lastWidth !== canvas.parentElement.clientWidth) {
                    lastWidth = canvas.parentElement.clientWidth;
                    clearTimeout(privates.resizeTimeout);
                    privates.resizeTimeout = setTimeout(() => {
                        privates.refresh(canvas);
                        this.updateCanvas();
                    }, 100);
                }
            };

            this.updateCanvas();
            
            privates.onconnected.forEach(method => {
                if (typeof method === 'function') {
                    method(this);
                } else {
                    throw new Error(`[Editor connected] Type ${typeof method} is not a function`);
                }
            });
        }

        updateCanvas(...args) { // TODO: partial canvas update
            if ((args.length > 0 && args.length < 4) || args.length > 4) {
                throw new SyntaxError("[updateCanvas] Must pass either 0 (zero) or 4 (four) parameters");
            }
            let y = this.lineHeight || 1.2 * (this.fontSize || 20);
            privates.lines.forEach(line => {
                line.render(y, this.clientWidth, undefined);
                y += line.totalHeight(this.clientWidth);
            });
        }

        checkAndSet(attribute, value, check, error) {
            if (value === undefined) {
                this.removeAttribute(attribute)
            } else if (check === undefined ||
                (typeof check === "function" && check(value)) ||
                (typeof check === "boolean" && check)
            ) {
                if (typeof value === 'string' && value.trim().length === 0) {
                    this.removeAttribute(attribute);
                }
                this.setAttribute(attribute, value);
            } else if (error !== undefined) {
                throw new Error(error); 
            }
        }
    });
})();
