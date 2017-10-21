import CSSFilter from './CSSFilter.class';

const TagsFilter = (() => {

    const ID = 'tags';      // the unique identified for the filter (used as the "key" used for local storage)
    const NAME = 'Tags';    // the internal "name" (NOT translated) for the filter (used for retrieving localized messages)

    class TagsFilter extends CSSFilter {

        /**
         * Filter constructor
         */
        constructor() {
            super(ID, NAME);
        }

        /**
         * Run whenever the filter data is updated
         * @param {object} filter - The filter that was updated
         */
        updateFilter(filter) {
            console.log('[Content] TagsFilter.updateFilter()', filter);

            super.resetFilter();

            filter.data.forEach((item) => {
                const placeholderText = browser.i18n.getMessage('FilterTypeTagsPlaceholderText', [item.tag]);

                const selector = item.wildcard ? '*' : '~';

                const browseSelectors = [
                    `.torpedo-container .thumb[data-tags${selector}="${item.tag}"]`,                    // browse (thumb wall)
                    `*[data-tags${selector}="${item.tag}"] a.full-view-link`                            // browse (full view)
                ];

                super.insertFilterRules(browseSelectors, placeholderText);
            });
        }
    }

    return TagsFilter;

})();

export default TagsFilter;
