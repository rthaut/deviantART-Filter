import Filter from './Filter.class';
import StyleSheet from '../../../helpers/stylesheet';

import { PLACEHOLDER_CSS, PLACEHOLDER_TEXT_CSS } from '../../../helpers/constants';

const TagsFilter = (() => {

    const FILTER_ID = 'tags';      // the "key" used for local storage
    const FILTER_NAME = 'Tags';    // used for retrieving localized messages

    class TagsFilter extends Filter {

        constructor(id, name) {
            super(FILTER_ID, FILTER_NAME);

            this.styleSheet = StyleSheet.Create();
        }

        resetFilter() {
            console.log('[Content] TagsFilter.resetFilter()');

            StyleSheet.Reset(this.styleSheet);
        }

        updateFilter(filter) {
            console.log('[Content] TagsFilter.updateFilter()', filter);

            this.resetFilter();

            const invisible = 'display: none !important;';

            filter.data.forEach((item) => {
                const text = browser.i18n.getMessage('FilterTypeTagsPlaceholderText', [item.tag]);

                const selector = item.wildcard ? '*' : '~';

                // common (placeholders vs. no placeholders) selectors for various DOM structures for thumbs
                const selectors = [
                    `.torpedo-container .thumb[data-tags${selector}="${item.tag}"]`,                    // browse (thumb wall)
                    `*[data-tags${selector}="${item.tag}"] a.full-view-link`                            // browse (full view)
                ];

                //TODO: the next 3 statements are currently the same for all CSS-based filters...
                //      maybe there should be a shared function that takes the selectors and the placeholder text?

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.no-placeholders ${selector}`).join(', ') + ` { ${invisible} }`);

                // show the placeholder image over the thumb image when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::before`).join(', ') + ` { ${PLACEHOLDER_CSS} }`);

                // show the placeholder text over the thumb (browse resuls page only) when using placeholders
                this.styleSheet.insertRule(selectors.map(selector => `body.placeholders ${selector}::after`).join(', ') + ` { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);
            });
        }
    }

    return TagsFilter;

})();

export default TagsFilter;
