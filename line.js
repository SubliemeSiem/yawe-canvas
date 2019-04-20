import { TextBlock } from "./text-block.js";

export class Line {
    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {TextBlock} textBlock 
     */
    constructor(context, font, size, lineheight, styles, colors, text, isHtml) {
        this._context = context;

        if (text && isHtml) {

        } else {
            this.textBlocks = [
                new TextBlock(
                    context,
                    font,
                    size,
                    lineheight,
                    styles,
                    colors,
                    text)
            ];
        }
    }

    /**
     * @param {TextBlock} textBlock 
     * @param {number} index 
     * @param {number} textIndex 
     */
    insert(textBlock, index, textIndex) {
        if (textBlock === undefined) {
            throw new Error("No TextBlock given to insert");
        }
        if (index) {
            if (textIndex) {
                var newBlock = this.textBlocks[index].split(textIndex);
                this.textBlocks.splice(index + 1, 0, textBlock, newBlock);
            } else {
                this.textBlocks.splice(index, 0, textBlock);
            }
        } else {
            this.textBlocks.push(textBlock);
        }
    }

    /**
     * @param {string} char 
     * @param {number} position 
     */
    insertText(char, position) {
        var index = 0;
        while (position - this.textBlocks[index].length >= 0 && index) {
            position -= this.textBlocks[index].length;
            index += 1;
            if (index >= this.textBlocks.length) {
                throw new RangeError("Invalid position");
            }
        }

        this.textBlocks[index].insert(char, position);
    }

    /**
     * @param {number} position 
     */
    removeChar(position) {
        var index = 0;
        while (position - this.textBlocks[index].length >= 0) {
            position -= this.textBlocks[index].length;
            index += 1;
            if (index >= this.textBlocks.length) {
                throw "Invalid position";
            }
        }

        this.textBlocks[index].remove(position);
    }

    /**
     * @param {number} maxWidth 
     * @returns {number} Total line height in pixels.
     */
    totalHeight(maxWidth) {
        var total = 0;
        var currentWidth = 0;
        var currentHeight = 0;
        this.textBlocks.forEach(block => {
            if (currentWidth + block.width < maxWidth) {
                currentHeight = Math.max(currentHeight, block.height);
                currentWidth = currentWidth + block.width;
            } else {
                total += currentHeight;
                if (block.width < maxWidth) {
                    currentHeight = block.height;
                    currentWidth = 0;
                } else {
                    var index = block.charsBefore(maxWidth);
                    while (index + 1 < block.length) {
                        total += block.height;
                        index = block.charsBefore(maxWidth, index);
                    }
                    currentHeight = index === block.length ? 0 : block.height;
                    currentWidth = index === block.length ? 0 : block.subWidth(index);
                }
            }
        });
        return total + currentHeight;
    }

    /**
     * @returns {string} Text content of the line without styling
     */
    toString() {
        return this.textBlocks.reduce((result, textBlock) => {
            return `${result}${textBlock.toString()}`;
        }, '');
    }

    /**
     * @returns {string} The resulting Html
     */
    toHtml() {
        return `${this.textBlocks.reduce((result, textBlock) => {
            return `${result}${textBlock.toHtml()}\n`;
        }, '')}<br/>\n`;
    }

    /**
     * @param {number} y 
     */
    render(y, maxWidth, selection) {
        let x = 0;
        this.textBlocks.forEach(block => {
            if (block.width + x <= maxWidth) {
                block.render(x, y, undefined, undefined, selection);
                x += block.width;
            } else {
                // check per word:
                // 1. few words fit => rest in new row
                // 2. nothing fits:
                // linebreak. first word:
                // a. fit on new row => OK
                // b. split on chars
            }
            
        });
    }
}