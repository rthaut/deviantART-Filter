import Filter from './Filter.class';
import StyleSheet from '../../../helpers/stylesheet';

import { PLACEHOLDER_CSS, PLACEHOLDER_LOGO_CSS } from '../../../helpers/constants';

const CSSFilter = (() => {

    const DEFAULT_VARS = {
        'placeholderBGColor': '#DDE6DA',
        'placeholderLogoColor': '#B4C0B0',
        'placeholderTextColor': '#B4C0B0'
    };

    class CSSFilter extends Filter {

        /**
         * CSSFilter constructor
         * @param {string} id The unique identified for the filter (used as the "key" used for local storage)
         * @param {string} name The internal "name" (NOT translated) of the filter (used for retrieving localized messages)
         */
        constructor(id, name) {
            super(id, name);

            this.styleSheet = StyleSheet.Create();

            this.varStyleSheet = StyleSheet.Create();
            this.setVariables();
        }

        async setVariables() {
            console.log('[Content] CSSFilter.setVariables()');

            StyleSheet.Reset(this.varStyleSheet);

            const vars = await browser.storage.sync.get(DEFAULT_VARS);
            this.varStyleSheet.insertRule(`:root {
                --placeholder-bg-color: ${vars.placeholderBGColor};
                --placeholder-logo-color: ${vars.placeholderLogoColor};
                --placeholder-text-color: ${vars.placeholderTextColor};
            }`);
        }

        /**
         * Resets the CSS stylesheet for this filter
         */
        resetFilter() {
            console.log(`[Content] CSSFilter('${this.name}').resetFilter()`);

            StyleSheet.Reset(this.styleSheet);
        }

        /**
         * Generates and inserts CSS rules into the CSS stylesheet for this filter
         * @param {string[]} browseSelectors The selectors for the Browse Results page
         * @param {string} placeholderText The text to show on the placeholder
         * @param {string[]} [additionalSelectors=[]] Additional selectors for other pages
         */
        insertFilterRules(browseSelectors, placeholderText, additionalSelectors = []) {
            console.log(`[Content] CSSFilter('${this.name}').insertFilterRules()`, browseSelectors, placeholderText, additionalSelectors);

            const invisible = 'display: none !important;';

            const allSelectors = [].concat(browseSelectors, additionalSelectors).filter((value, index, array) => array.indexOf(value) === index);

            // hide the entire thumb completely when not using placeholders
            this.styleSheet.insertRule(allSelectors.map(selector => `body.no-placeholders ${selector}`).join(', ') + ` { ${invisible} }`);

            // show a placeholder (with text) over the thumb image when using placeholders
            this.styleSheet.insertRule(allSelectors.map(selector => `body.placeholders ${selector}::before`).join(', ') + ` { content: "${placeholderText}"; ${PLACEHOLDER_CSS} }`);

            // show an image over the placeholder when using placeholders
            this.styleSheet.insertRule(allSelectors.map(selector => `body.placeholders ${selector}::after`).join(', ') + ` { ${PLACEHOLDER_LOGO_CSS} }`);
        }
    }

    return CSSFilter;

})();

export default CSSFilter;
