import Filter from './Filter.class';

const UsersFilter = (() => {

    const ID = 'users';      // the unique identified for the filter (used as the "key" used for local storage)
    const NAME = 'Users';    // the internal "name" (NOT translated) for the filter (used for retrieving localized messages)

    const PROPERTIES = [
        {
            'field': 'username',
            'title': browser.i18n.getMessage('FilterTypeUsersPropertyUsernameTitle'),
            'label': browser.i18n.getMessage('FilterTypeUsersPropertyUsernameLabel'),
            'hint': browser.i18n.getMessage('FilterTypeUsersPropertyUsernameHint'),
            'required': true,
            'visible': true,
            'editable': true,
            'type': 'text',
            'default': '',
            'pattern': '[\\w\\-]+'
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

    class UsersFilter extends Filter {

        constructor() {
            super(ID, NAME, PROPERTIES);
        }

        /**
         * Normalizes all properties on a user object
         * @param {object} item Object representing a filterable user
         * @returns {object} The normalized user object
         */
        normalize(item) {
            console.log('UsersFilter.normalize()', item);

            if (item.username !== undefined) {
                item.username = item.username.toLowerCase();
            }

            return super.normalize(item);
        }

        /**
         * Validates all required properties on a filter object
         * @param {object} item Object representing a filterable item
         * @returns {boolean} True if the item is valid
         */
        isValid(item) {
            console.log('UsersFilter.isValid()', item);

            if (item.username === 'www') {
                return false;
            }

            return super.isValid(item);
        }

    }

    return UsersFilter;

})();

export default UsersFilter;
