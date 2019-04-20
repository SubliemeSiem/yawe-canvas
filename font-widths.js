/**
 * @class Caches character widths for different fonts
 */
export class FontWidthMap {
    constructor() {
        this._data = new Map();
    }

    /**
     * Get the character widths for a given font
     * @param {string} font The font for which to get widths
     * @returns {Map<string, number>} Characters with their widths
     */
    for(font) {
        if (!/^(bold )?(italic )?(underline )?[1-9][0-9]*px [a-zA-Z0-9-]+$/.test()){
            // will not catch all invalid fonts, but is a simple check
            throw "Invalid font";
        }
        if (!this._data.has(font)) {
            this._data.set(font, new Map());
        }
        return this._data.get(font);
    }
}
