let UsersFilter = {

    id: 'users',    // internal (used as the storage key)

    /**
     * Get the meta data for the Users filter
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
     * Get the list of filtered users
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
     * Get the CSS to hide all filtered users
     * @returns {string} The CSS to hide all filtered users
     */
    getCSS: function () {
        console.log('UsersFilter.getCSS()');
        return UsersFilter.getFilterData().then((users) => {
            let css = '';

            let selector = '.torpedo-container .thumb';
            let invisible = 'display: none !important;';
            let placeholder = `position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url(${browser.extension.getURL('images/filtered.png')}) no-repeat center;`;

            users.forEach(function (user) {
                css += `body.no-placeholders ${selector}[href*="//${user.username}.deviantart.com"] { ${invisible} }`;
                css += `body.placeholders ${selector} a.torpedo-thumb-link[href*="//${user.username}.deviantart.com"]::before { ${placeholder} }`;
            }, this);

            return css;
        });
    },

    add: function (user) {
        console.log('UsersFilter.add()', user);

        // normalize properties
        user.username = user.username.toLowerCase();

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
            return browser.storage.local.set(data)
        }).then(() => {
            return UsersFilter.getFilterData();
        });
    },

    remove: function (user) {
        console.log('UsersFilter.remove()', user);

        // normalize properties
        user.username = user.username.toLowerCase();

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
            return browser.storage.local.set(data)
        }).then(() => {
            return UsersFilter.getFilterData();
        });
    }

};
