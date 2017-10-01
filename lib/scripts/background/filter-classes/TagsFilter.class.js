import Filter from './Filter.class.js';

const TagsFilter = (() => {

    const FILTER_ID = 'tags';      // the "key" used for local storage
    const FILTER_NAME = 'Tags';    // used for retrieving localized messages
    const FILTER_PROPERTIES = {
        'required': [
            {
                'field': 'tag',
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
         * Get the CSS to hide all filtered tags
         * @returns {string} The CSS to hide all filtered tags
         */
        getFilterCSS() {
            console.log('TagsFilter.getFilterCSS()');

            const selector = '.torpedo-container .thumb';
            const invisible = 'display: none !important;';

            const placeholder = [
                'z-index: 5;',
                'position: absolute;',
                'top: 0;',
                'right: 0;',
                'bottom: 0;',
                'left: 0;',
                'height: 100%;',
                'width: 100%;',
                'content: "";',
                `background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`
            ].join(' ');

            const placeholder_text = [
                'z-index: 6;',
                'position: absolute;',
                'top: calc(50% + 64px);',
                'right: 0;',
                'left: 0;',
                'width: 100%;',
                'text-align: center;',
                'color: #B4C0B0;',
                'font-weight: bold;'
            ].join(' ');

            return this.getFilterData().then((items) => {
                const css = [];

                items.forEach((item) => {
                    const text = browser.i18n.getMessage('FilterTypeTagsPlaceholderText', item.tag);
                    css.push(`body.no-placeholders ${selector}[data-tags*="${item.tag}"] { ${invisible} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags*="${item.tag}"]::before { ${placeholder} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags*="${item.tag}"]::after { content: "${text}"; ${placeholder_text} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags*="${item.tag}"] + span.info { ${invisible} }`);
                });

                return css.join('\n');
            });
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

        /**
         * Validates all required properties on a tag object
         * @param {object} item - Object represneting a filterable tag
         * @returns {boolean} -True if the tag is valid
         */
        isValid(item) {
            console.log('TagsFilter.isValid()', item);

            return item.tag && item.tag.length;
        }

    }

    return TagsFilter;

})();

export default TagsFilter;
