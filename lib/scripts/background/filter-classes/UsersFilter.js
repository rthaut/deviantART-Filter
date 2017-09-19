const UsersFilter = (() => {

    const FILTER_ID = 'users';

    class UsersFilter {

        constructor() {
            this.id = FILTER_ID;
        }

        /**
         * Gets the meta data for the Users filter
         * @returns {Object} The meta data for the Users filter
         */
        getMetaData() {
            console.log('UsersFilter.getMetaData()');
            return {
                'id': FILTER_ID,
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
        }

        /**
         * Gets the list of filtered users
         * @param {number} [limit] - the limit of filtered users to retrieve
         * @param {number} [offset] - the starting index of filtered users to retrieve
         * @returns {Object[]} The list of filtered users
         */
        getFilterData(limit, offset) {
            console.log('UsersFilter.getFilterData()', limit, offset);
            return browser.storage.local.get(FILTER_ID).then((data) => {
                if (data[FILTER_ID] == undefined) {
                    return [];
                }

                if (limit == undefined || limit == null) {
                    limit = data[FILTER_ID].length;
                }

                if (offset == undefined || offset == null) {
                    offset = 0;
                }

                return data[FILTER_ID].slice(offset, limit);
            });
        }

        /**
         * Get the CSS to hide the user
         * @param {object} user - Object represneting a filterable user
         * @returns {string} The CSS to hide the user
         */
        getCSS(user) {
            console.log('UsersFilter.getCSSForUser()');

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
            // normalize properties
            user.username = user.username.toLowerCase();

            return user;
        }

        /**
         * Determines if the user is already filtered or not
         * @param {object} user - Object representing a filterable user
         * @returns {boolean} True if the user is already filtered
         */
        exists(user) {
            console.log('UsersFilter.exists()', user);

            user = this.normalize(user);

            return this.getFilterData().then((users) => {
                for (let i = 0; i < users.length; i++) {
                    if (user.username == users[i].username) {
                        return true
                    }
                }
                return false;
            });
        }

        /**
         * Filters the user
         * @param {object} user - Object representing a user to be filtered
         * @param {number} [limit] - the limit of filtered users to return
         * @param {number} [offset] - the starting index of filtered users to return
         * @returns {object[]} Array of currently filtered users
         */
        add(user, limit, offset) {
            console.log('UsersFilter.add()', user);

            user = this.normalize(user);

            return this.getFilterData().then((users) => {
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
                data[FILTER_ID] = users;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Un-filters the user
         * @param {object} user - Object representing a user to be un-filtered
         * @param {number} [limit] - the limit of filtered users to return
         * @param {number} [offset] - the starting index of filtered users to return
         * @returns {object[]} Array of currently filtered users
         */
        remove(user, limit, offset) {
            console.log('UsersFilter.remove()', user);

            user = this.normalize(user);

            return this.getFilterData().then((users) => {
                for (let i = 0; i < users.length; i++) {
                    if (user.username == users[i].username) {
                        users.splice(i, 1);
                        return users;
                    }
                }
                throw new Error(`User "${user.username}" was not filtered`);    //@TODO i18n
            }).then((users) => {
                let data = {};
                data[FILTER_ID] = users;
                return browser.storage.local.set(data);
            }).then(() => {
                return this.getFilterData(limit, offset);
            });
        }

        /**
         * Filters or un-filters the user
         * @param {object} user - Object representing a user to be filtered/un-filtered
         * @param {number} [limit] - the limit of filtered users to return
         * @param {number} [offset] - the starting index of filtered users to return
         * @returns {object[]} Array of currently filtered users
         */
        toggle(user) {
            console.log('UsersFilter.toggle()', user);

            user = this.normalize(user);

            return this.exists(user).then((exists) => {
                return exists ? this.remove(user) : this.add(user);
            });
        }

    }

    return new UsersFilter();

})();

export default UsersFilter;
