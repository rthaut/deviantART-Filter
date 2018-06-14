import Filter from './Filter.class';

const TagsFilter = (() => {

    const ID = 'tags';      // the unique identified for the filter (used as the "key" used for local storage)
    const NAME = 'Tags';    // the internal "name" (NOT translated) for the filter (used for retrieving localized messages)

    const PROPERTIES = [
        {
            'field': 'tag',
            'title': browser.i18n.getMessage('FilterTypeTagsPropertyTagTitle'),
            'label': browser.i18n.getMessage('FilterTypeTagsPropertyTagLabel'),
            'hint': browser.i18n.getMessage('FilterTypeTagsPropertyTagHint'),
            'required': true,
            'visible': true,
            'editable': true,
            'type': 'text',
            'default': '',
            'pattern': '\\S+'
        },
        {
            'field': 'wildcard',
            'title': browser.i18n.getMessage('FilterTypeTagsPropertyWildcardTitle'),
            'label': browser.i18n.getMessage('FilterTypeTagsPropertyWildcardLabel'),
            'hint': browser.i18n.getMessage('FilterTypeTagsPropertyWildcardHint'),
            'required': true,
            'visible': true,
            'editable': true,
            'type': 'boolean',
            'default': false
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

    class TagsFilter extends Filter {

        constructor() {
            super(ID, NAME, PROPERTIES);
        }

        /**
         * Normalizes all properties on a tag object
         * @param {object} item Object representing a filterable tag
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

            return super.normalize(item);
        }

    }

    return TagsFilter;

})();

export default TagsFilter;
