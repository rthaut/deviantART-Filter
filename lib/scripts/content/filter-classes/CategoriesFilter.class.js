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

                // hide the entire thumb completely when not using placeholders
                this.styleSheet.insertRule(`body.no-placeholders .thumb[data-category-path^="${item.path}"] { ${invisible} }`);

                // show the placeholder image over the thumb when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-category-path^="${item.path}"] a::before { ${PLACEHOLDER_CSS} }`);

                // show the placeholder text over the thumb (fancy thumbs only) when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-category-path^="${item.path}"] a.torpedo-thumb-link::after { content: "${text}"; ${PLACEHOLDER_TEXT_CSS} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders .thumb[data-category-path^="${item.path}"] a.torpedo-thumb-link + span.info { ${invisible} }`);

                // hide the user toggle corner icon for thumbs filtered by a category to avoid confusion
                this.styleSheet.insertRule(`body.placeholders .thumb[data-category-path^="${item.path}"] a.torpedo-thumb-link span.hide-user-corner { ${invisible} }`);
            });
        }
    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
