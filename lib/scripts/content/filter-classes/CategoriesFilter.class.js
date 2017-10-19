import Filter from './Filter.class';
import StyleSheet from '../../../helpers/stylesheet';

import { PLACEHOLDER_CSS, PLACEHOLDER_TEXT_CSS } from '../../../helpers/constants';

const CategoriesFilter = (() => {

    const FILTER_ID = 'categories';      // the "key" used for local storage
    const FILTER_NAME = 'Categories';    // used for retrieving localized messages

    class CategoriesFilter extends Filter {

        constructor(id, name) {
            super(FILTER_ID, FILTER_NAME);

            this.styleSheet = StyleSheet.Create();
        }

        resetFilter() {
            console.log('[Content] CategoriesFilter.resetFilter()');

            StyleSheet.Reset(this.styleSheet);
        }

        updateFilter(filter) {
            console.log('[Content] CategoriesFilter.updateFilter()', filter);

            this.resetFilter();

            const invisible = 'display: none !important;';

            filter.data.forEach((item) => {
                // trim the category name down to just the last 3 levels (or less)
                let name = item.name;
                const divider = ' > ';
                if (name.indexOf(divider) !== -1) {
                    const names = name.split(divider);
                    name = names.slice(Math.max(names.length - 3, 0)).join(divider);
                }

                const text = browser.i18n.getMessage('FilterTypeCategoriesPlaceholderText', [name]);

                // common (placeholders vs. no placeholders) selectors for various DOM structures for thumbs
                const selectors = [
                    `.torpedo-container .thumb[data-category-path^="${item.path}"]`,                    // browse (thumb wall)
                    `*[data-category-path^="${item.path}"] a.full-view-link`                            // browse (full view)
                ];

                //TODO: the next 3 statements are currently the same for all CSS-based filters...
                //      maybe there should be a shared function that takes the selectors and the placeholder text?

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.no-placeholders ${selector}`).join(', ') + ` { ${invisible} }`);

                // show the placeholder image over the thumb image when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::before`).join(', ') + ` { ${PLACEHOLDER_CSS} }`);

                // show the placeholder text over the thumb (browse resuls page only) when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::after`).join(', ') + ` { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);

                //TODO: fix the span.info background that pops up now when hovering over filtered thumbs...
            });
        }
    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
