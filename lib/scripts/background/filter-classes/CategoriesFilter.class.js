import Filter from './Filter.class.js';

const CategoriesFilter = (() => {

    const FILTER_ID = 'categories';      // the "key" used for local storage
    const FILTER_NAME = 'Categories';    // used for retrieving localized messages
    const FILTER_PROPERTIES = {
        'required': [
            {
                'field': 'path',
                'type': 'hierarchy',
                'subtype': 'category',
                'label': 'Select Category',
                'title': 'Path' //@TODO i18n
            }
        ],
        'available': [
            {
                'field': 'name',
                'type': 'text',
                'title': 'Name' //@TODO i18n
            },
            {
                'field': 'path',
                'type': 'hierarchy',
                'title': 'Path' //@TODO i18n
            },
            {
                'field': 'created',
                'type': 'date',
                'title': 'Date Created' //@TODO i18n
            }
        ]
    };

    class CategoriesFilter extends Filter {

        constructor() {
            super(FILTER_ID, FILTER_NAME, FILTER_PROPERTIES);
        }

        /**
         * Normalizes all properties on a category object
         * @param {object} item - Object represneting a filterable category
         * @returns {object} The normalized category object
         */
        normalize(item) {
            console.log('CategoriesFilter.normalize()', item);

            // normalize properties
            if (item.category) {
                item.category = item.category.toLowerCase();
            }

            return item;
        }

    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
