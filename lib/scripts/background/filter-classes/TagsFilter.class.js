import Filter from './Filter.class.js';

const TagsFilter = (() => {

    const FILTER_ID = 'tags';      // the "key" used for local storage
    const FILTER_NAME = 'Tags';    // used for retrieving localized messages
    const FILTER_PROPERTIES = {
        'required': [
            {
                'field': 'tag',
                'pattern': '[a-zA-Z0-9]+',
                'type': 'text',
                'title': 'Tag' //@TODO i18n
            }
        ],
        'available': [
            {
                'field': 'tag',
                'type': 'text',
                'title': 'Tag' //@TODO i18n
            },
            {
                'field': 'created',
                'type': 'date',
                'title': 'Date Created' //@TODO i18n
            }
        ]
    };

    class TagsFilter extends Filter {

        constructor() {
            super(FILTER_ID, FILTER_NAME, FILTER_PROPERTIES);
        }

        /**
         * Normalizes all properties on a tag object
         * @param {object} item - Object represneting a filterable tag
         * @returns {object} The normalized tag object
         */
        normalize(item) {
            console.log('TagsFilter.normalize()', item);

            // normalize properties
            if (item.tag) {
                item.tag = item.tag.toLowerCase();
            }

            return item;
        }

    }

    return TagsFilter;

})();

export default TagsFilter;
