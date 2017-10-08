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
