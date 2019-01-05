import Filter from './Filter.class';
import StyleSheet from '../../../helpers/stylesheet';

import { PLACEHOLDER_CSS, PLACEHOLDER_TEXT_CSS } from '../../../helpers/constants';

const CSSFilter = (() => {

    class CSSFilter extends Filter {

        /**
         * CSSFilter constructor
         * @param {string} id The unique identified for the filter (used as the "key" used for local storage)
         * @param {string} name The internal "name" (NOT translated) of the filter (used for retrieving localized messages)
         */
        constructor(id, name) {
            super(id, name);

            this.styleSheet = StyleSheet.Create();
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

            // show the placeholder image over the thumb image when using placeholders
            this.styleSheet.insertRule(allSelectors.map(selector => `body.placeholders ${selector}::before`).join(', ') + ` { ${PLACEHOLDER_CSS} }`);

            // show the placeholder text over the thumb (browse results page only) when using placeholders
            this.styleSheet.insertRule(browseSelectors.map(selector => `body.placeholders ${selector}::after`).join(', ') + ` { content: "${placeholderText}"; ${PLACEHOLDER_TEXT_CSS} }`);
        }
    }

    return CSSFilter;

})();

export default CSSFilter;
