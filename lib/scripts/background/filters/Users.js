let UsersFilter = {

    id: 'users',    // internal (used as the storage key)

    /**
     * Gets the meta data for the Users filter
     * @returns {Object} The meta data for the Users filter
     */
    getMetaData: function () {
        console.log('UsersFilter.getMetaData()');
        return {
            'id': UsersFilter.id,
            'name': {
                'singular': browser.i18n.getMessage(`FilterTypeUsersName`),
                'plural': browser.i18n.getMessage(`FilterTypeUsersNamePlural`)
            },
            'properties': {
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
            },
            'labels': {
                'none': browser.i18n.getMessage(`FilterTypeUsersLabelNone`),
                'help': browser.i18n.getMessage(`FilterTypeUsersLabelHelp`)
            }
        }
    },

    /**
     * Gets the list of filtered users
     * @param {number} [limit] - the limit of filtered users to retrieve
     * @param {number} [offset] - the starting index of filtered users to retrieve
     * @returns {Object[]} The list of filtered users
     */
    getFilterData: function (limit, offset) {
        console.log('UsersFilter.getFilterData()', limit, offset);
        return browser.storage.local.get(UsersFilter.id).then((data) => {
            if (data[UsersFilter.id] == undefined) {
                return [];
            }

            if (limit == undefined || limit == null) {
                limit = data[UsersFilter.id].length;
            }

            if (offset == undefined || offset == null) {
                offset = 0;
            }

            return data[UsersFilter.id].slice(offset, limit);
        });
    },

    /**
     * Get the CSS to hide the user
     * @param {object} user - Object represneting a filterable user
     * @returns {string} The CSS to hide the user
     */
    getCSS: function (user) {
        console.log('UsersFilter.getCSSForUser()');

        let selector = '.torpedo-container .thumb';
        let invisible = 'display: none !important;';
        let placeholder = `z-index: 5; position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`;

        let css = '';
        css += `body.no-placeholders ${selector}[href*="//${user.username}.deviantart.com"] { ${invisible} }`;
        css += `body.placeholders ${selector} a.torpedo-thumb-link[href*="//${user.username}.deviantart.com"]::before { ${placeholder} }`;

        return css;
    },

    /**
     * Normalizes all properties on a user object
     * @param {object} user - Object represneting a filterable user
     * @returns {object} The normalized user object
     */
    normalize: function (user) {
        // normalize properties
        user.username = user.username.toLowerCase();

        return user;
    },

    /**
     * Determines if the user is already filtered or not
     * @param {object} user - Object representing a filterable user
     * @returns {boolean} True if the user is already filtered
     */
    exists: function (user) {
        console.log('UsersFilter.exists()', user);

        user = UsersFilter.normalize(user);

        return UsersFilter.getFilterData().then((users) => {
            for (let i = 0; i < users.length; i++) {
                if (user.username == users[i].username) {
                    return true
                }
            }
            return false;
        });
    },

    /**
     * Filters the user
     * @param {object} user - Object representing a user to be filtered
     * @param {number} [limit] - the limit of filtered users to return
     * @param {number} [offset] - the starting index of filtered users to return
     * @returns {object[]} Array of currently filtered users
     */
    add: function (user, limit, offset) {
        console.log('UsersFilter.add()', user);

        user = UsersFilter.normalize(user);

        return UsersFilter.getFilterData().then((users) => {
            for (let i = 0; i < users.length; i++) {
                if (user.username == users[i].username) {
                    throw new Error(`User "${user.username}" is already filtered`);    //@TODO i18n
                }
            }
            user.created = Date.now();
            users.push(user);
            return users;
        }).then((users) => {
            let data = {};
            data[UsersFilter.id] = users;
            return browser.storage.local.set(data);
        }).then(() => {
            return UsersFilter.getFilterData(limit, offset);
        });
    },

    /**
     * Un-filters the user
     * @param {object} user - Object representing a user to be un-filtered
     * @param {number} [limit] - the limit of filtered users to return
     * @param {number} [offset] - the starting index of filtered users to return
     * @returns {object[]} Array of currently filtered users
     */
    remove: function (user, limit, offset) {
        console.log('UsersFilter.remove()', user);

        user = UsersFilter.normalize(user);

        return UsersFilter.getFilterData().then((users) => {
            for (let i = 0; i < users.length; i++) {
                if (user.username == users[i].username) {
                    users.splice(i, 1);
                    return users;
                }
            }
            throw new Error(`User "${user.username}" was not filtered`);    //@TODO i18n
        }).then((users) => {
            let data = {};
            data[UsersFilter.id] = users;
            return browser.storage.local.set(data);
        }).then(() => {
            return UsersFilter.getFilterData(limit, offset);
        });
    },

    /**
     * Filters or un-filters the user
     * @param {object} user - Object representing a user to be filtered/un-filtered
     * @param {number} [limit] - the limit of filtered users to return
     * @param {number} [offset] - the starting index of filtered users to return
     * @returns {object[]} Array of currently filtered users
     */
    toggle: function (user) {
        console.log('UsersFilter.toggle()', user);

        user = UsersFilter.normalize(user);

        return UsersFilter.exists(user).then((exists) => {
            return exists ? UsersFilter.remove(user) : UsersFilter.add(user);
        });
    }

};
