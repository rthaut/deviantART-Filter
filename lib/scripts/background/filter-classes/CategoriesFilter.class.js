import Filter from './Filter.class.js';

const CategoriesFilter = (() => {

    const FILTER_ID = 'categories';      // the "key" used for local storage
    const FILTER_NAME = 'Categories';    // used for retrieving localized messages
    const FILTER_PROPERTIES = [
        {
            'field': 'name',
            'title': 'Category Name', //@TODO i18n
            'label': '',
            'hint': '',
            'required': true,
            'visible': true,
            'editable': false,
            'type': 'text',
            'default': ''
        },
        {
            'field': 'path',
            'title': 'Category Path', //@TODO i18n
            'label': 'Select Category', //@TODO i18n
            'hint': '',
            'required': true,
            'visible': false,
            'editable': true,
            'type': 'text',
            'default': '',
            'pattern': /^[\w\-]+(?:\/[\w\-]+)*$/
        },
        {
            'field': 'created',
            'title': 'Date Created', //@TODO i18n
            'label': '',
            'hint': '',
            'required': false,
            'visible': true,
            'editable': false,
            'type': 'date'
        }
    ];

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

            if (item.path !== undefined) {
                item.path = item.path.toLowerCase();
            }

            return item;
        }

    }

    return CategoriesFilter;

})();

export default CategoriesFilter;
