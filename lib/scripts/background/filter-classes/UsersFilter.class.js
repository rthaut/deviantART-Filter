import Filter from './Filter.class';

const UsersFilter = (() => {

    const FILTER_ID = 'users';      // the "key" used for local storage
    const FILTER_NAME = 'Users';    // used for retrieving localized messages
    const FILTER_PROPERTIES = [
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
            'pattern': /^[\w\-]+$/
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
            super(FILTER_ID, FILTER_NAME, FILTER_PROPERTIES);
        }

        /**
         * Normalizes all properties on a user object
         * @param {object} item - Object represneting a filterable user
         * @returns {object} The normalized user object
         */
        normalize(item) {
            console.log('UsersFilter.normalize()', item);

            if (item.username !== undefined) {
                item.username = item.username.toLowerCase();
            }

            return item;
        }

    }

    return UsersFilter;

})();

export default UsersFilter;
