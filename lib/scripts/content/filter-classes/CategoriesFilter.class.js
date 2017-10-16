import Filter from './Filter.class.js';
import StyleSheet from '../../../helpers/stylesheet.js';

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

            //TODO: these constants are (currently) shared between filters...
            //      Maybe declare them on the base Filter class instead?
            //      Or make a new CSS Filter class for them to extend?

            const thumb = '.torpedo-container .thumb';
            const invisible = 'display: none !important;';

            const placeholder = [
                'z-index: 5;',
                'position: absolute;',
                'top: 0;',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: 100%;',
                'content: "";',
                `background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`
            ].join('\n');

            const placeholder_text = [
                'z-index: 6;',
                'position: absolute;',
                'top: calc(50% + 64px);',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'width: 100%;',
                'height: calc(100% - calc(50% + 64px));',
                'text-align: center;',
                'color: #B4C0B0;',
                'font-weight: bold;',
                'line-height: 1.25em'
            ].join('\n');

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
                this.styleSheet.insertRule(`body.no-placeholders ${thumb}[data-category-path^="${item.path}"] { ${invisible} }`);

                // show the placeholder image and text over the link of thumbs when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${thumb} a.torpedo-thumb-link[data-category-path^="${item.path}"]::before { ${placeholder} }`);
                this.styleSheet.insertRule(`body.placeholders ${thumb} a.torpedo-thumb-link[data-category-path^="${item.path}"]::after { content: "${text}"; ${placeholder_text} }`);

                // hide the info panel that displays on mouseover when using placeholders
                this.styleSheet.insertRule(`body.placeholders ${thumb} a.torpedo-thumb-link[data-category-path^="${item.path}"] + span.info { ${invisible} }`);

                // hide the user toggle corner icon for thumbs filtered by a category to avoid confusion
                this.styleSheet.insertRule(`body.placeholders ${thumb} a.torpedo-thumb-link[data-category-path^="${item.path}"] span.hide-user-corner { ${invisible} }`);
            });
        }
    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
