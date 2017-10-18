import Filter from './Filter.class.js';
import StyleSheet from '../../../helpers/stylesheet.js';

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

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(`body.no-placeholders .thumb[data-tags${selector}="${item.tag}"] { ${invisible} }`);

                // show the placeholder image over the thumb when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-tags${selector}="${item.tag}"] a::before { ${PLACEHOLDER_CSS} }`);

                // show the placeholder text over the thumb (fancy thumbs only) when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-tags${selector}="${item.tag}"] a.torpedo-thumb-link::after { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-tags${selector}="${item.tag}"] a.torpedo-thumb-link + span.info { ${invisible} }`);

                // hide the user toggle corner icon for thumbs filtered by a tag to avoid confusion
                this.styleSheet.insertRule(`body.placeholders .thumb[data-tags${selector}="${item.tag}"] a.torpedo-thumb-link span.hide-user-corner { ${invisible} }`);
            });
        }
    }

    return TagsFilter;

})();

export default TagsFilter;
