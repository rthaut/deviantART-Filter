import Filter from './Filter.class';

const CategoriesFilter = (() => {

    const ID = 'categories';      // the unique identified for the filter (used as the "key" used for local storage)
    const NAME = 'Categories';    // the internal "name" (NOT translated) for the filter (used for retrieving localized messages)

    const PROPERTIES = [
        {
            'field': 'name',
            'title': browser.i18n.getMessage('FilterTypeCategoriesPropertyNameTitle'),
            'label': browser.i18n.getMessage('FilterTypeCategoriesPropertyNameLabel'),
            'hint': browser.i18n.getMessage('FilterTypeCategoriesPropertyNameHint'),
            'required': true,
            'visible': true,
            'editable': false,
            'type': 'text',
            'default': ''
        },
        {
            'field': 'path',
            'title': browser.i18n.getMessage('FilterTypeCategoriesPropertyPathTitle'),
            'label': browser.i18n.getMessage('FilterTypeCategoriesPropertyPathLabel'),
            'hint': browser.i18n.getMessage('FilterTypeCategoriesPropertyPathHint'),
            'required': true,
            'visible': false,
            'editable': true,
            'type': 'hierarchy',
            'subtype': 'category',
            'default': '',
            'pattern': '[\\w\\-]+(?:\\/[\\w\\-]+)*'
        },
        {
            'field': 'created',
            'title': browser.i18n.getMessage('FilterTypeGenericPropertyDateTitle'),
            'label': browser.i18n.getMessage('FilterTypeGenericPropertyDateLabel'),
            'hint': browser.i18n.getMessage('FilterTypeGenericPropertyDateHint'),
            'required': false,
            'visible': true,
            'editable': false,
            'type': 'date'
        }
    ];

    class CategoriesFilter extends Filter {

        constructor() {
            super(ID, NAME, PROPERTIES);
        }

        /**
         * Normalizes all properties on a category object
         * @param {object} item Object representing a filterable category
         * @returns {object} The normalized category object
         */
        normalize(item) {
            console.log('CategoriesFilter.normalize()', item);

            if (item.path !== undefined) {
                item.path = item.path.toLowerCase();
            }

            return super.normalize(item);
        }

    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
