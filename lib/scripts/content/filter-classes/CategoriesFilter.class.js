import CSSFilter from './CSSFilter.class';

const CategoriesFilter = (() => {

    const ID = 'categories';      // the unique identified for the filter (used as the "key" used for local storage)
    const NAME = 'Categories';    // the internal "name" (NOT translated) for the filter (used for retrieving localized messages)

    class CategoriesFilter extends CSSFilter {

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
            console.log('[Content] CategoriesFilter.updateFilter()', filter);

            super.resetFilter();

            filter.data.forEach((item) => {
                // trim the category name down to just the last 3 levels (or less)
                let name = item.name;
                const divider = ' > ';
                if (name.indexOf(divider) !== -1) {
                    const names = name.split(divider);
                    name = names.slice(Math.max(names.length - 3, 0)).join(divider);
                }

                const placeholderText = browser.i18n.getMessage('FilterTypeCategoriesPlaceholderText', [name]);

                const browseSelectors = [
                    `.torpedo-container .thumb[data-category-path^="${item.path}"]`,                    // browse (thumb wall)
                    `*[data-category-path^="${item.path}"] a.full-view-link`                            // browse (full view)
                ];

                super.insertFilterRules(browseSelectors, placeholderText);
            });
        }
    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
