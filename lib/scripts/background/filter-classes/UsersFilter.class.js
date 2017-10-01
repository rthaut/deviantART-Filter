import Filter from './Filter.class.js';

const UsersFilter = (() => {

    const FILTER_ID = 'users';      // the "key" used for local storage
    const FILTER_NAME = 'Users';    // used for retrieving localized messages
    const FILTER_PROPERTIES = {
        'required': [
            {
                'field': 'username',
                'type': 'text',
                'title': 'Username' //@TODO i18n
            }
        ],
        'available': [
            {
                'field': 'username',
                'type': 'text',
                'title': 'Username' //@TODO i18n
            },
            {
                'field': 'created',
                'type': 'date',
                'title': 'Date Created' //@TODO i18n
            }
        ]
    };

    class UsersFilter extends Filter {

        constructor() {
            super(FILTER_ID, FILTER_NAME, FILTER_PROPERTIES);
        }

        /**
         * Get the CSS to hide all filtered users
         * @returns {string} The CSS to hide all filtered users
         */
        getFilterCSS() {
            console.log('UsersFilter.getFilterCSS()');

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
                    const text = browser.i18n.getMessage('FilterTypeUsersPlaceholderText', item.username);
                    css.push(`body.no-placeholders ${selector}[href*="//${item.username}.deviantart.com"] { ${invisible} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[href*="//${item.username}.deviantart.com"]::before { ${placeholder} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[href*="//${item.username}.deviantart.com"]::after { content: "${text}"; ${placeholder_text} }`);
                    css.push(`body.placeholders ${selector} a.torpedo-thumb-link[data-tags*="${item.tag}"] + span.info { ${invisible} }`);
                });

                return css.join('\n');
            });
        }

        /**
         * Normalizes all properties on a user object
         * @param {object} item - Object represneting a filterable user
         * @returns {object} The normalized user object
         */
        normalize(item) {
            console.log('UsersFilter.normalize()', item);

            // normalize properties
            if (item.username) {
                item.username = item.username.toLowerCase();
            }

            return item;
        }

        /**
         * Validates all required properties on a user object
         * @param {object} item - Object represneting a filterable user
         * @returns {boolean} -True if the user is valid
         */
        isValid(item) {
            console.log('UsersFilter.isValid()', item);

            return item.username && item.username.length;
        }

    }

    return UsersFilter;

})();

export default UsersFilter;
