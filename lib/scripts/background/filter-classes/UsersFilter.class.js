import Filter from './Filter.class.js';

const UsersFilter = (() => {

    const FILTER_ID = 'users';      // the "key" used for local storage
    const FILTER_NAME = 'Users';    // used for retrieving localized messages

    class UsersFilter extends Filter {

        constructor() {
            let properties = {
                'required': {
                    'username': {
                        'type': 'text',
                        'label': 'Username' //@TODO i18n
                    }
                },
                'available': {
                    'username': {
                        'type': 'text',
                        'label': 'Username' //@TODO i18n
                    },
                    'created': {
                        'type': 'date',
                        'label': 'Date Created' //@TODO i18n
                    }
                }
            };
            super(FILTER_ID, FILTER_NAME, properties);
        }

        /**
         * Get the CSS to hide the user
         * @param {object} user - Object represneting a filterable user
         * @returns {string} The CSS to hide the user
         */
        getCSS(user) {
            console.log('UsersFilter.getCSS()');

            let selector = '.torpedo-container .thumb';
            let invisible = 'display: none !important;';
            let placeholder = `z-index: 5; position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`;

            let css = '';
            css += `body.no-placeholders ${selector}[href*="//${user.username}.deviantart.com"] { ${invisible} }`;
            css += `body.placeholders ${selector} a.torpedo-thumb-link[href*="//${user.username}.deviantart.com"]::before { ${placeholder} }`;

            return css;
        }

        /**
         * Normalizes all properties on a user object
         * @param {object} user - Object represneting a filterable user
         * @returns {object} The normalized user object
         */
        normalize(user) {
            console.log('UsersFilter.normalize()', user);

            // normalize properties
            if (user.username) {
                user.username = user.username.toLowerCase();
            }

            return user;
        }

        /**
         * Validates all required properties on a user object
         * @param {object} user - Object represneting a filterable user
         * @returns {boolean} -True if the user is valid
         */
        isValid(user) {
            console.log('UsersFilter.isValid()', user);

            return user.username && user.username.length
        }

    }

    return UsersFilter;

})();

export default UsersFilter;
