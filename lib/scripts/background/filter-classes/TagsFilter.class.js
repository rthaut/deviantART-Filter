import Filter from './Filter.class.js';

const TagsFilter = (() => {

    const FILTER_ID = 'tags';      // the "key" used for local storage
    const FILTER_NAME = 'Tags';    // used for retrieving localized messages
    const FILTER_PROPERTIES = [
        {
            'field': 'tag',
            'title': 'Tag', //@TODO i18n
            'label': 'Enter Tag', //@TODO i18n
            'hint': '',
            'required': true,
            'visible': true,
            'editable': true,
            'type': 'text',
            'default': '',
            'pattern': /^\S+$/
        },
        {
            'field': 'wildcard',
            'title': 'Wildcard', //@TODO i18n
            'label': 'Is Wildcard', //@TODO i18n
            'hint': 'Wildcard filters match aggressively (ex: "art" would also match "fanart" and "artistic")', //@TODO i18n
            'required': true,
            'visible': true,
            'editable': true,
            'type': 'boolean',
            'default': false
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

            if (item.tag !== undefined) {
                item.tag = item.tag.toLowerCase();
            }

            if (item.wildcard !== undefined) {
                if (typeof item.wildcard === 'string') {
                    item.wildcard = (item.wildcard.toLowerCase() == 'true');
                }
            }

            return item;
        }

    }

    return TagsFilter;

})();

export default TagsFilter;
