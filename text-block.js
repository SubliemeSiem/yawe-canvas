/**
 * @param {Map<string, boolean>} styles 
 */
function toStyleString(styles) {
    return [...styles.entries()]
        .filter(([_style, isActive]) => isActive)
        .reduce((prev, [style, _active]) => `${prev}${style} `, '');
}

export class TextBlock {
    /**
     * @param {string} font
     */
    set font(font) {
        this._font = font;
    }

    /** 
     * @param {number} size In pixels
    */
    set size(size) {
        this._size = size;
    }

    /**
     * @param {string} color Color code, like #000000;.
     */
    set color(color) {
        this._colors.primary = color;
    }

    /**
     * @param {string} backgroundColor Color code, like #000000;.
     */
    set backgroundColor(backgroundColor) {
        this._colors.background = backgroundColor;
    }

    /**
     * @param {number} fontSize
     */
    set fontSize(fontSize) {
        this._size = fontSize;
        this._lineHeight = 1.2 * fontSize;
        this._charWidths = new Map();
    }

    /**
     * @returns {number} The width in pixels
     */
    get width() {
        return this._lengths.reduce((prev, cur) => prev + cur, 0);
    }

    /**
     * @returns {number} The height in pixels
     */
    get height() {
        return 1.2 * this._size;
    }

    /**
     * @returns {number} The length of the text in chars
     */
    get length() {
        return this._text.length;
    }

    /**
     * @returns {string} The applied styles (bold, italic, underline) as a string
     */
    get style() {
        return this._stylesString;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {string} font 
     * @param {number} size 
     * @param {Map<string, boolean>} styles 
     * @param {{text: string, background: string, selectionText: string, selectionBackground: string, selectionTextBlurred: string, selectionBackgroundBlurred: string}}} colors 
     * @param {string} text 
     */
    constructor(context, font, size, lineheight, styles, colors, text) {
        this._context = context;
        this._font = font || 'sans-serif';
        this._size = size || 20;
        this._lineHeight = lineheight || this._size * 1.2;
        this._styles = styles || new Map()
                .set('bold', false)
                .set('italic', false)
                .set('underline', false);
        
        this._colors = Object.assign({}, {
            text: '#FFFFFF',
            background: '#763282',
            selectionBackground: '#3377FF',
            selectionBackgroundBlurred: '#123456',
            selectionText: '#FFFFFF',
            selectionTextBlurred: '#654321'
        }, colors);

        this._text = text || '';
        this._stylesString = toStyleString(this._styles);

        this._charWidths = new Map();
        this._lengths = [...this._text].map((char) => this.measureWidth(char));
    }

    /**
     * @param {number} start 
     * @param {number} end 
     */
    subWidth(start, end) {
        return this._lengths.slice(start, end).reduce((prev, cur) => prev + cur, 0);
    }

    /**
     * @param {number} x 
     * @param {number} startAt 
     */
    charsBefore(x, startAt) {
        if (startAt > this._lengths.length) {
            throw 'faeag';
        }
        var index = startAt || 0;
        var totalWidth = 0;
        while (index < this._lengths.length && totalWidth + this._lengths[index] <= x) {
            totalWidth += this._lengths[index]; 
            index += 1;
        }
        return index - 1;
    }

    setContext() {
        console.log(`${this._stylesString}${this._size}px ${this._font}`);
        this._context.font = `${this._stylesString}${this._size}px ${this._font}`;
    }

    /**
     * @returns {number} Width of the char
     * @param {string} char 
     */
    measureWidth(char) {
        if (!this._charWidths.has(char)) {
            this.setContext();
            this._charWidths.set(char, this._context.measureText(char).width);
        }
        return this._charWidths.get(char);
    }

    /**
     * Toggle bold, italic and underline
     * @param {string} style The style to toggle
     * @param {boolean} force If set, sets the style to this value
     */
    toggleStyle(style, force) {
        if (force !== undefined) {
            this._styles.set(style, force);
        } else {
            this._styles.set(style, !(this._styles.has(style) && this._styles.get(style)));
        }
        this._stylesString = toStyleString(this._styles.entries());
    }

    /**
     * @param {string} char 
     * @param {number} index 
     */
    insert(char, index) {
        if (index === undefined || index > this._text.length || index < 0) {
            throw `[TextBlock.insert] Value of ${index} not valid for 'index'`;
        }
        this._text = `${this.text.substring(0, index)}${char}${this._text.substring(index)}`;
        this._lengths.splice(index, 0, this.measureWidth(char));
    }

    remove(start, end) {
        if (start === undefined || start >= this._text.length || start < 0) {
            throw `[TextBlock.remove] Value of ${start} not valid for 'start'`;
        }
        if (end !== undefined) { 
            if (end > this._text.length) {
                throw `[TextBlock.remove] Value of ${end} too high for 'end'`;
            }
            if (end < start) {
                throw `[TextBlock.remove] 'start' can't be larger than 'end'`;
            }
        }
        this._text = `${this._text.substring(0, start)}${this._text.substring(end || (start + 1))}`;
        amount = end === undefined ? 1 : end - start;
        this._lengths.splice(start, amount);
    }

    render(x, y, start, end, selection) {
        if (start !== undefined && (start >= this._text.length || start < 0)) {
            throw `[TextBlock.render] Value of ${start} not valid for 'start'`;
        }
        if (end !== undefined) {
            if (end > this._text.length) {
                throw `[TextBlock.render] Value of ${end} too high for 'end'`;
            }
            if (end < start) {
                throw `[TextBlock.render] 'start' can't be larger than 'end'`;
            }
        }
        this.setContext();
        
        var renderText = start ? this._text.substring(start, end) : this._text;
        if (this._colors.background) {
            this._context.fillStyle = this._colors.background;
            var dif = ((this._lineHeight / this._size) - 1) * this._size;
            // this._context.fillRect(x, y - (.8 * this._lineHeight), this.measureWidth(renderText), this._lineHeight);
            this._context.fillRect(x, y - (.8 * this._lineHeight) + (.5 * dif), this.measureWidth(renderText), this._size);
        }

        this._context.fillStyle = this._colors.text;
        this._context.fillText(renderText, x, y);
    }

    split(index) {
        if (index === undefined || index > this._text.length || index < 0) {
            throw `[TextBlock.split] Value of ${index} not valid for 'index'`;
        }
        var splitContent = this._text.substring(index);
        this._text = this._text.substring(0, index);
        this._lengths = this._lengths.slice(0, index);
        var result = new TextBlock(this._context, this._font, this._size, this._lineHeight, this._styles, this._colors, splitContent);
        return result;
    }

    clone(withContent) {
        return new TextBlock(
            this._context,
            this._font,
            this._size,
            this._styles,
            this._colors,
            withContent ? this._text : '');
    }

    toString() {
        return this._text;
    }

    toHtml() {
        var result = this._text;
        if (this._styles.get('bold')) {
            result = `<b>${result}</b>`;
        }
        if (this._styles.get('italic')) {
            result = `<i>${result}</i>`;
        }
        if (this._styles.get('underline')) {
            result = `<u>${result}</u>`;
        }
        var style = `color: ${this._colors.primary};`;
        if (this._colors.secondary) {
            style += ` background-color: ${this._colors.secondary};`;
        }
        style += ` font-size: ${this._size}px;`;
        style += ` font-family: ${this._font};`;
        style += ` line-height: ${1.2 * this._size}px;`;
        return `<span style="${style}">\n    ${result}\n</span>`;
    }
}